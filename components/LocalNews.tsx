
import React, { useState, useEffect } from 'react';
import type { Article } from '../types';
import { NewspaperIcon, SummarizeIcon, ShareIcon, XIcon, BookmarkIcon } from './icons';
import { summarizeText } from '../services/geminiService';
import { shareContent } from '../utils/share';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

const ArticleCard: React.FC<{ article: Article, setShareStatus: (status: string) => void, onReadMore: (article: Article) => void }> = ({ article, setShareStatus, onReadMore }) => {
    const { user, addBookmark, removeBookmark, isBookmarked, openAuthModal } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const bookmarked = isBookmarked({ type: 'article', itemId: article.id });

    const handleShare = async () => {
        const status = await shareContent({
            title: article.title,
            text: article.snippet,
            url: window.location.href + '#news',
        });
        setShareStatus(status);
    };

    const handleSummarize = async () => {
        if(summary) { // If summary is already there, hide it
            setSummary(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await summarizeText(article.content);
            setSummary(result);
        } catch (err: any) {
            setError('Failed to summarize.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBookmarkToggle = () => {
        if (!user) {
            openAuthModal('login');
            return;
        }
        const bookmark = { type: 'article' as const, itemId: article.id };
        if (bookmarked) {
            removeBookmark(bookmark);
        } else {
            addBookmark(bookmark);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
            <img className="h-48 w-full object-cover" src={article.imageUrl} alt={article.title} />
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 text-sm flex-grow">{article.snippet}</p>
                {summary && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
                    </div>
                )}
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button onClick={() => onReadMore(article)} className="text-sm font-semibold text-orange-600 hover:text-orange-500">Read More</button>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={handleBookmarkToggle}
                            aria-label="Bookmark article"
                            title="Bookmark article"
                            className="p-2 rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                           <BookmarkIcon className={`h-5 w-5 ${bookmarked ? 'text-orange-500 fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={handleShare}
                            aria-label="Share article"
                            title="Share article"
                            className="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        >
                            <ShareIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleSummarize}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-orange-500 rounded-full hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Summarizing...</span>
                                </>
                            ) : (
                               <>
                                <SummarizeIcon />
                                <span>{summary ? 'Hide Summary' : 'Summarize'}</span>
                               </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MemoizedArticleCard = React.memo(ArticleCard);

const LocalNews: React.FC = () => {
  const { articles } = useContent();
  const [shareStatus, setShareStatus] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (shareStatus) {
        const timer = setTimeout(() => setShareStatus(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [shareStatus]);

  return (
    <section id="news" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
            <NewspaperIcon />
            <span className="ml-3">Local Stories & News</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">Stay updated with the latest happenings in Gorakhpur.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <MemoizedArticleCard key={article.id} article={article} setShareStatus={setShareStatus} onReadMore={setSelectedArticle} />
          ))}
        </div>

        {selectedArticle && (
            <div 
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
                onClick={() => setSelectedArticle(null)}
            >
                <div 
                    className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start justify-between p-6 border-b">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close article"
                        >
                            <XIcon />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        <img className="h-64 w-full object-cover rounded-lg mb-6" src={selectedArticle.imageUrl.replace('400/250', '800/400')} alt={selectedArticle.title} />
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedArticle.content}</p>
                    </div>
                </div>
            </div>
        )}

        {shareStatus && <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{shareStatus}</div>}
      </div>
    </section>
  );
};

export default LocalNews;