/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { useState, useRef, useEffect } from 'react';
import { askGorakhpurGuideStream } from '../services/geminiService';
import { SparklesIcon, SendIcon, LocationPinIcon, MicrophoneIcon } from './icons';
import type { Message, Location } from '../types';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  // In a real app, use a library like 'marked' or 'react-markdown' for security and features.
  const createMarkup = (markdown: string) => {
    let html = markdown
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Process line by line for lists
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('* ')) {
          return `<li>${line.trim().substring(2)}</li>`;
        }
        return line;
      })
      .join('\n');
    
    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>').replace(/<\/ul>\n<ul>/g, '');

    // Replace newlines with <br> for non-list items
    html = html.replace(/\n/g, '<br />');
    html = html.replace(/<br \/><ul>/g, '<ul>'); // clean up breaks before lists
    html = html.replace(/<\/ul><br \/>/g, '</ul>'); // clean up breaks after lists


    return { __html: html };
  };

  return <div dangerouslySetInnerHTML={createMarkup(text)} />;
};


const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const { user, openAuthModal } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(10);
  
  const { events, services, products } = useContent();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const FREE_QUESTION_LIMIT = 10;
  const QUESTION_COUNT_KEY = 'aiQuestionCount';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, showThinking]);

  useEffect(() => {
    if (user) {
      setIsLocked(false);
      setQuestionsLeft(Infinity);
    } else {
      const count = parseInt(localStorage.getItem(QUESTION_COUNT_KEY) || '0', 10);
      const remaining = FREE_QUESTION_LIMIT - count;
      setQuestionsLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        setIsLocked(true);
      }
    }
  }, [user]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    if (isLocked) {
        openAuthModal('register');
        return;
    }
    
    if (!user) {
        const currentCount = parseInt(localStorage.getItem(QUESTION_COUNT_KEY) || '0', 10);
        const newCount = currentCount + 1;
        localStorage.setItem(QUESTION_COUNT_KEY, newCount.toString());
        const remaining = FREE_QUESTION_LIMIT - newCount;
        setQuestionsLeft(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
            setIsLocked(true);
        }
    }

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    
    setQuery('');
    setIsLoading(true);
    setShowThinking(true);

    let firstChunk = true;
    try {
      const stream = askGorakhpurGuideStream(message, events, services, products, location);
      
      let fullResponse = "";
      let groundingChunks: any[] | undefined;

      for await (const chunk of stream) {
        if (firstChunk) {
          setShowThinking(false);
          setMessages(prev => [...prev, { role: 'model', content: '' }]);
          firstChunk = false;
        }

        fullResponse += chunk.text;
        if(chunk.groundingChunks) {
            groundingChunks = chunk.groundingChunks;
        }

        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'model') {
                lastMessage.content = fullResponse;
                lastMessage.groundingChunks = groundingChunks;
            }
            return newMessages;
        });
      }
    } catch (err: any) {
        const errorMessage: Message = { role: 'model', content: err.message || 'An unexpected error occurred.' };
        if (firstChunk) {
            setShowThinking(false);
            setMessages(prev => [...prev, errorMessage]);
        } else {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        }
    } finally {
      setIsLoading(false);
      setShowThinking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(query);
  };

  const handleLocationToggle = () => {
    if (!isLocationEnabled) { // Turning ON
        if (!navigator.geolocation) {
            setLocationStatus('error');
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setLocationStatus('loading');
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setIsLocationEnabled(true);
                setLocationStatus('success');
                setMessages([]);
            },
            (error) => {
                setLocationStatus('error');
                setLocationError(error.message);
                setLocation(null);
                setIsLocationEnabled(false);
            }
        );
    } else { // Turning OFF
        setLocation(null);
        setIsLocationEnabled(false);
        setLocationStatus('idle');
        setLocationError(null);
        setMessages([]);
    }
  };

  const handleToggleListening = () => {
    if (isLoading || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setQuery(''); // Clear input before starting
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
      <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
        <div 
          className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-orange-500 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
           {isUser ? (
             <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
           ) : (
            <div className="text-sm sm:text-base prose prose-sm max-w-none">
              <MarkdownRenderer text={message.content} />
            </div>
           )}
          {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Sources from Google Maps:</h4>
              <div className="flex flex-wrap gap-2">
                {message.groundingChunks.map((chunk, index) => {
                  if (chunk.maps) {
                    return (
                      <a 
                        key={index}
                        href={chunk.maps.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
                      >
                        <LocationPinIcon />
                        {chunk.maps.title}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const examplePrompts = [
    "What are some good places to eat near me?",
    "Are there any music events happening this weekend?",
    "Tell me about the history of the Gorakhnath Temple."
  ];

  const InitialPrompts: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <div className="text-orange-500">
             <SparklesIcon />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-800">Ask me anything!</h3>
          <p className="mt-1 text-sm text-gray-500">I'm your personal guide to Gorakhpur.</p>
          <div className="mt-6 space-y-2 w-full max-w-sm">
              {examplePrompts.map((prompt, i) => (
                  <button 
                      key={i} 
                      onClick={() => onPromptClick(prompt)}
                      className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                      {prompt}
                  </button>
              ))}
          </div>
      </div>
  );

  return (
    <section id="ai-assistant" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
            <SparklesIcon />
            <span className="ml-3">Your Gorakhpur AI Guide</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">Ask anything about our city, and our AI will answer!</p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg flex flex-col h-[75vh]">
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50">
            {messages.length === 0 && !isLoading ? (
                <InitialPrompts onPromptClick={sendMessage} />
            ) : (
                messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))
            )}
            
            {showThinking && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-100/50 rounded-b-2xl">
            {isLocked ? (
              <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg animate-fade-in-up">
                <h4 className="font-semibold text-orange-800">You've reached your free question limit!</h4>
                <p className="text-sm text-orange-700 mt-1">Please sign up or log in to continue asking unlimited questions.</p>
                <div className="mt-4 flex justify-center space-x-4">
                    <button
                        onClick={() => openAuthModal('login')}
                        className="px-6 py-2 bg-white border border-orange-500 text-orange-500 font-semibold rounded-md hover:bg-orange-50 transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => openAuthModal('register')}
                        className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
            ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                <label htmlFor="location-toggle" className="flex items-center cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" id="location-toggle" className="sr-only" checked={isLocationEnabled} onChange={handleLocationToggle} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${isLocationEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${isLocationEnabled ? 'translate-x-full' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-gray-700">
                    <span className="font-semibold text-sm">Use My Location</span>
                    <p className="text-xs text-gray-500">For nearby places.</p>
                  </div>
                </label>
              </div>
              
              {locationStatus === 'loading' && <p className="text-xs text-center text-gray-500 mb-2">Getting your location...</p>}
              {locationStatus === 'success' && <p className="text-xs text-center text-green-600 mb-2">Location shared successfully!</p>}
              {locationStatus === 'error' && <p className="text-xs text-center text-red-600 mb-2">Error: {locationError}</p>}
              
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask your question here..."}
                    className="w-full p-4 pr-28 text-gray-700 bg-white rounded-full border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-all"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={handleToggleListening}
                      className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isLoading || !recognitionRef.current}
                      aria-label={isListening ? "Stop listening" : "Start voice input"}
                    >
                      <MicrophoneIcon />
                    </button>
                    <button
                      type="submit"
                      className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      disabled={isLoading || !query.trim()}
                      aria-label="Send message"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </form>
              {!user && (
                  <p className="text-xs text-center text-gray-500 mt-3">
                      You have {questionsLeft} free question{questionsLeft !== 1 ? 's' : ''} left.
                  </p>
              )}
            </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;