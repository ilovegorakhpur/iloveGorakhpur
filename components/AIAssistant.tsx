
import React, { useState, useRef, useEffect } from 'react';
import { askGorakhpurGuide } from '../services/geminiService';
import { SparklesIcon, SendIcon, LocationPinIcon, MicrophoneIcon } from './icons';
import type { Message, Location } from '../types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const { text, groundingChunks } = await askGorakhpurGuide(message, isThinkingMode, location);
      const modelMessage: Message = { role: 'model', content: text, groundingChunks };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: Message = { role: 'model', content: err.message || 'An unexpected error occurred.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(query);
  };

  const handleThinkingModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsThinkingMode(e.target.checked);
    setMessages([]); // Clear history as the backend chat session will reset
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
  
  const examplePrompts = [
    "What are the top 5 must-visit places in Gorakhpur?",
    "Tell me about the history of the Gorakhnath Temple.",
    "Where can I find the best street food near me?",
    "What is Gorakhpur famous for?",
  ];

  const handleExampleClick = (prompt: string) => {
    sendMessage(prompt);
  };
  
  const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
      <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-orange-500 text-white rounded-br-none' 
              : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
          }`}
        >
          <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
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
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm sm:text-base font-medium text-gray-600">{isThinkingMode ? "Thinking deeply..." : "Thinking..."}</span>
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

          {messages.length === 0 && !isLoading && (
             <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
                <p className="text-sm text-center font-semibold text-gray-600 mb-3">Or try one of these examples to start:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {examplePrompts.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleExampleClick(prompt)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-orange-100 text-orange-800 text-xs sm:text-sm rounded-full hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
            </div>
          )}

          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-100/50 rounded-b-2xl">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label htmlFor="thinking-toggle" className="flex items-center cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" id="thinking-toggle" className="sr-only" checked={isThinkingMode} onChange={handleThinkingModeToggle} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${isThinkingMode ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${isThinkingMode ? 'translate-x-full' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-700">
                  <span className="font-semibold text-sm">Thinking Mode</span>
                  <p className="text-xs text-gray-500">For complex queries.</p>
                </div>
              </label>

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
                  placeholder={isListening ? "Listening..." : (messages.length > 0 ? "Ask a follow-up question..." : "Ask your first question...")}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
