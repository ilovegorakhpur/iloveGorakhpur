
import React, { useState, useEffect } from 'react';
import type { Article } from '../types';
import { NewspaperIcon, SummarizeIcon, ShareIcon, XIcon } from './icons';
import { summarizeText } from '../services/geminiService';
import { shareContent } from '../utils/share';

const mockArticles: Article[] = [
  {
    id: 1,
    title: 'Gorakhpur Zoo Welcomes Two Bengal Tiger Cubs',
    snippet: 'The Shaheed Ashfaq Ullah Khan Prani Udyan has announced the birth of two healthy Bengal tiger cubs, a significant event for the city\'s conservation efforts...',
    imageUrl: 'https://picsum.photos/400/250?random=1',
    content: `The Shaheed Ashfaq Ullah Khan Prani Udyan in Gorakhpur is celebrating a joyous occasion with the arrival of two Bengal tiger cubs. The cubs, one male and one female, were born to the zoo's resident tigress, 'Meera', and are reported to be in excellent health. Zoo officials have stated that this is a major milestone for their captive breeding program and a testament to the high standard of care provided at the facility. The cubs will be kept under close observation for the next few months and will not be available for public viewing immediately to ensure their well-being. This event is expected to significantly boost visitor interest and further establish the Gorakhpur Zoo as a key center for wildlife conservation in the region.`
  },
  {
    id: 2,
    title: 'New Flyover at Paidleganj to Ease Traffic Congestion',
    snippet: 'Construction is set to begin on a new multi-lane flyover at the busy Paidleganj intersection, promising to alleviate long-standing traffic issues...',
    imageUrl: 'https://picsum.photos/400/250?random=2',
    content: `In a major infrastructural development for Gorakhpur, the government has approved the construction of a new six-lane flyover at the Paidleganj crossing. This intersection is one of the city's most notorious traffic bottlenecks, especially during peak hours. The project aims to provide a seamless flow of traffic for vehicles heading towards Deoria and Kushinagar from the city center. Officials from the Public Works Department have outlined a 24-month timeline for the project's completion. While some temporary disruptions are expected during the construction phase, the long-term benefits of reduced travel time and lower pollution levels are being hailed as a significant step forward for the city's urban planning.`
  },
   {
    id: 3,
    title: 'Annual Gorakhpur Mahotsav to Feature Local Artisans',
    snippet: 'This year\'s Gorakhpur Mahotsav will place a special emphasis on promoting local arts and crafts, with over 50 stalls dedicated to regional artisans...',
    imageUrl: 'https://picsum.photos/400/250?random=3',
    content: `The upcoming Gorakhpur Mahotsav, scheduled for next month, is set to be a vibrant celebration of local culture, with a particular focus on the region's talented artisans. The event organizers have announced that a dedicated 'Shilp Gram' (Craft Village) will be a central attraction, featuring more than 50 stalls. These stalls will showcase a wide array of traditional products, including the world-famous terracotta pottery, handmade textiles, and intricate woodwork. The initiative aims to provide a platform for these artisans to reach a wider audience and to preserve the rich artistic heritage of the Purvanchal region. The festival will also include cultural performances, food festivals, and various competitions.`
  },
];

const ArticleCard: React.FC<{ article: Article, setShareStatus: (status: string) => void, onReadMore: (article: Article) => void }> = ({ article, setShareStatus, onReadMore }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                            onClick={handleShare}
                            aria-label="Share article"
                            title="Share article"
                            className="p-2 rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
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

const LocalNews: React.FC = () => {
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
          {mockArticles.map(article => (
            <ArticleCard key={article.id} article={article} setShareStatus={setShareStatus} onReadMore={setSelectedArticle} />
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
