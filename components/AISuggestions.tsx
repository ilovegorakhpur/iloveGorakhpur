/*
 * Copyright (c) 2024, iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { useState } from 'react';
import type { Post, LocalEvent, Product, Article } from '../types';
import { useAuth } from '../context/AuthContext';
import { generateProfileSuggestions } from '../services/geminiService';
import { LoadingIcon, SparklesIcon } from './icons';

interface AISuggestionsProps {
    posts: Post[];
    events: LocalEvent[];
    products: Product[];
    bookmarks: { type: string; item?: Post | LocalEvent | Product | Article }[];
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Basic markdown renderer for lists
    const createMarkup = (markdown: string) => {
        let html = markdown
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .split('\n')
            .map(line => {
                if (line.trim().startsWith('* ')) {
                return `<li>${line.trim().substring(2)}</li>`;
                }
                return line;
            })
            .join('');

        if (html.includes('<li>')) {
            html = `<ul>${html}</ul>`;
        }

        return { __html: html.replace(/\n/g, '<br />') };
    };
    return <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={createMarkup(text)} />;
};

const AISuggestions: React.FC<AISuggestionsProps> = ({ posts, events, products, bookmarks }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const hasActivity = posts.length > 0 || events.length > 0 || products.length > 0 || bookmarks.length > 0;

    const handleGenerate = async () => {
        setIsLoading(true);
        setSuggestions(null);
        setError(null);
        
        // Create a summary of user activity
        const activitySummary = `
            - Created Posts: ${posts.map(p => p.title).join(', ') || 'None'}
            - Created Events: ${events.map(e => e.title).join(', ') || 'None'}
            - Listed Products: ${products.map(p => p.name).join(', ') || 'None'}
            - Bookmarked Items: ${bookmarks.map(b => b.item && ('title' in b.item ? b.item.title : b.item.name)).filter(Boolean).join(', ') || 'None'}
        `;

        try {
            const result = await generateProfileSuggestions(activitySummary.trim());
            setSuggestions(result);
        } catch (err: any) {
            setError('Failed to get suggestions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-2xl shadow-lg mt-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <SparklesIcon />
                <span className="ml-2">Just for you, {user?.name.split(' ')[0]}!</span>
            </h3>
            <p className="text-gray-600 mt-2">Get personalized suggestions based on your activity to discover more of what you love in Gorakhpur.</p>

            {hasActivity ? (
                <div className="mt-6">
                    {!suggestions && !isLoading && (
                         <button
                            onClick={handleGenerate}
                            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform hover:scale-105"
                        >
                            Get AI Suggestions
                        </button>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center h-24">
                            <div className="flex items-center space-x-2 text-gray-500">
                                <LoadingIcon />
                                <span>Thinking of great ideas...</span>
                            </div>
                        </div>
                    )}
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    
                    {suggestions && (
                        <div className="bg-white/60 p-4 rounded-lg">
                           <MarkdownRenderer text={suggestions} />
                           <button onClick={handleGenerate} className="text-xs font-semibold text-orange-600 hover:underline mt-4">Generate new suggestions</button>
                        </div>
                    )}

                </div>
            ) : (
                <p className="mt-4 text-sm text-gray-500 italic">Start interacting with the app by creating posts, listing items, or bookmarking things you like to get personalized suggestions!</p>
            )}
        </div>
    );
};

export default AISuggestions;