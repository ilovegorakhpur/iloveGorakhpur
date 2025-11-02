
import React, { useState } from 'react';
import { getTopicExplanation } from '../services/geminiService';
import { BookOpenIcon, XIcon } from './icons';

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const createMarkup = (markdown: string) => {
    let html = markdown
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^(#+)\s+(.*)/gm, (_, hashes, content) => `<h${hashes.length}>${content}</h${hashes.length}>`)
      .replace(/^\s*\n\*/gm, '<ul>\n*')
      .replace(/^(\s*)\*(.*)/gm, '$1<li>$2</li>')
      .replace(/<\/li>\n(?!<li>)/g, '</li>\n</ul>')
      .replace(/\n/g, '<br />');
    return { __html: html };
  };
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={createMarkup(text)} />;
};


const GorakhpurExplained: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    
    const topics = [
        "The History of Gorakhnath Temple",
        "The Art of Terracotta",
        "Famous Local Dishes of Gorakhpur",
        "The Significance of Gita Press",
        "Ramgarh Tal Lake: A Transformation",
        "Key Figures in Gorakhpur's History",
    ];

    const handleTopicClick = async (topic: string) => {
        setSelectedTopic(topic);
        setIsLoading(true);
        setContent('');
        try {
            const explanation = await getTopicExplanation(topic);
            setContent(explanation);
        } catch (error) {
            setContent("Sorry, I couldn't fetch information on this topic at the moment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const closeModal = () => {
        setSelectedTopic(null);
        setContent('');
    };

    const TopicCard: React.FC<{topic: string}> = ({topic}) => (
        <button
            onClick={() => handleTopicClick(topic)}
            className="w-full text-left p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
        >
            <h3 className="text-lg font-bold text-gray-800">{topic}</h3>
        </button>
    );

    return (
        <section id="explained" className="py-16 sm:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
                        <BookOpenIcon />
                        <span className="ml-3">Gorakhpur Explained</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">Discover the stories and facts behind our city's landmarks and culture.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {topics.map(topic => <TopicCard key={topic} topic={topic} />)}
                </div>

                {selectedTopic && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <div 
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between p-6 border-b">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedTopic}</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                                    <XIcon />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>Generating Article...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <MarkdownRenderer text={content} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GorakhpurExplained;
