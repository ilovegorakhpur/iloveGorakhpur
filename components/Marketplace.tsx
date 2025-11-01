
import React, { useState, useMemo } from 'react';
import type { LocalEvent, Product } from '../types';
import { ShoppingCartIcon, TicketIcon, ShareIcon } from './icons';

const mockEvents: LocalEvent[] = [
  { id: 1, title: 'Live Music Night at The Brew House', date: 'Sat, Aug 24, 8:00 PM', location: 'The Brew House, Golghar', price: 499, imageUrl: 'https://picsum.photos/400/250?random=10', category: 'Music' },
  { id: 2, title: 'Gorakhpur Terracotta Workshop', date: 'Sun, Aug 25, 11:00 AM', location: 'Craft Village, Taramandal', price: 250, imageUrl: 'https://picsum.photos/400/250?random=11', category: 'Workshop' },
  { id: 3, title: 'Sunday Stand-up Comedy', date: 'Sun, Aug 25, 7:00 PM', location: 'Central Perk Cafe', price: 300, imageUrl: 'https://picsum.photos/400/250?random=12', category: 'Comedy' },
];

const mockProducts: Product[] = [
    { id: 1, name: 'Handmade Terracotta Horse', seller: 'Shilpi Crafts', price: 1200, imageUrl: 'https://picsum.photos/400/400?random=20', category: 'Handicrafts' },
    { id: 2, name: 'Gorakhpuri Spices Combo', seller: 'Masala Junction', price: 450, imageUrl: 'https://picsum.photos/400/400?random=21', category: 'Food' },
    { id: 3, name: 'Pure Local Honey (500g)', seller: 'Purvanchal Farms', price: 350, imageUrl: 'https://picsum.photos/400/400?random=22', category: 'Food' },
];


const Marketplace: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'events' | 'products'>('events');
    const [searchTerm, setSearchTerm] = useState('');

    const handleTabChange = (tab: 'events' | 'products') => {
        setActiveTab(tab);
        setSearchTerm(''); // Clear search on tab switch
    };

    const filteredEvents = useMemo(() => {
        return mockEvents.filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const filteredProducts = useMemo(() => {
        return mockProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleBuyClick = (itemName: string) => {
        alert(`Thank you for your interest in ${itemName}! Full checkout functionality is coming soon.`);
    };

    const handleShareEvent = async (event: LocalEvent) => {
        const shareData = {
          title: event.title,
          text: `Check out this event in Gorakhpur: ${event.title} on ${event.date} at ${event.location}.`,
          url: window.location.href + '#marketplace',
        };
    
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.error('Error sharing event:', err);
          }
        } else {
          const shareText = `${shareData.title}\n\nWhen: ${event.date}\nWhere: ${event.location}\n\nFind out more at: ${shareData.url}`;
          try {
              await navigator.clipboard.writeText(shareText);
              alert('Event details copied to clipboard!');
          } catch (err) {
              console.error('Failed to copy event details: ', err);
              alert('Sharing is not available on this browser.');
          }
        }
      };

    return (
        <section id="marketplace" className="py-16 sm:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
                        <ShoppingCartIcon />
                        <span className="ml-3">Gorakhpur Marketplace</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">Discover local events and products, all in one place.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Tabs */}
                    <div className="mb-8 flex justify-center border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange('events')}
                            className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'events' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Events & Tickets
                        </button>
                        <button
                            onClick={() => handleTabChange('products')}
                            className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'products' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Local Products
                        </button>
                    </div>

                    {/* Search Bar */}
                     <div className="mb-8 max-w-lg mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`Search for ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 text-gray-700 bg-gray-100 rounded-full border-2 border-transparent focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        {activeTab === 'events' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredEvents.map(event => (
                                    <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
                                        <img className="h-48 w-full object-cover" src={event.imageUrl} alt={event.title} />
                                        <div className="p-4 flex flex-col flex-grow">
                                            <p className="text-sm font-semibold text-orange-600 mb-1">{event.date}</p>
                                            <h3 className="text-lg font-bold text-gray-900 flex-grow">{event.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <button 
                                                    onClick={() => handleShareEvent(event)}
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors"
                                                    aria-label="Share event"
                                                >
                                                    <ShareIcon className="h-4 w-4" />
                                                    <span>Share</span>
                                                </button>
                                                <div className="flex items-center space-x-3">
                                                    <p className="text-lg font-bold text-gray-800">₹{event.price}</p>
                                                    <button onClick={() => handleBuyClick(event.title)} className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors">
                                                        <TicketIcon />
                                                        Buy Tickets
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'events' && filteredEvents.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-600">No events found matching your search.</p>
                            </div>
                        )}


                        {activeTab === 'products' && (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col text-center">
                                        <div className="p-4 bg-gray-100">
                                            <img className="h-48 w-48 object-cover rounded-lg mx-auto" src={product.imageUrl} alt={product.name} />
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1 mb-3 flex-grow">by {product.seller}</p>
                                            <p className="text-xl font-bold text-gray-800 mb-4">₹{product.price}</p>
                                            <button onClick={() => handleBuyClick(product.name)} className="w-full mt-auto px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'products' && filteredProducts.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-600">No products found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Marketplace;