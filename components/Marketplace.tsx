
import React, { useState } from 'react';
import type { LocalEvent, Product } from '../types';
import { ShoppingCartIcon, TicketIcon } from './icons';

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

    const handleBuyClick = (itemName: string) => {
        alert(`Thank you for your interest in ${itemName}! Full checkout functionality is coming soon.`);
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
                            onClick={() => setActiveTab('events')}
                            className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'events' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Events & Tickets
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'products' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Local Products
                        </button>
                    </div>

                    {/* Content */}
                    <div>
                        {activeTab === 'events' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {mockEvents.map(event => (
                                    <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
                                        <img className="h-48 w-full object-cover" src={event.imageUrl} alt={event.title} />
                                        <div className="p-4 flex flex-col flex-grow">
                                            <p className="text-sm font-semibold text-orange-600 mb-1">{event.date}</p>
                                            <h3 className="text-lg font-bold text-gray-900 flex-grow">{event.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <p className="text-lg font-bold text-gray-800">₹{event.price}</p>
                                                <button onClick={() => handleBuyClick(event.title)} className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors">
                                                    <TicketIcon />
                                                    Buy Tickets
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'products' && (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {mockProducts.map(product => (
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
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Marketplace;
