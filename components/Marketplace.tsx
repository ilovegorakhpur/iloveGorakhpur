
import React, { useState, useMemo, useEffect } from 'react';
import type { LocalEvent, Product } from '../types';
import { ShoppingCartIcon, TicketIcon, ShareIcon, PlusIcon, ClockIcon, RefreshIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { shareContent } from '../utils/share';

const initialMockEvents: LocalEvent[] = [
  { id: 1, title: 'Live Music Night at The Brew House', date: 'Sat, Aug 24, 8:00 PM', location: 'The Brew House, Golghar', price: 499, imageUrl: 'https://picsum.photos/400/250?random=10', category: 'Music', duration: '3 hours' },
  { id: 2, title: 'Gorakhpur Terracotta Workshop', date: 'Sun, Aug 25, 11:00 AM', location: 'Craft Village, Taramandal', price: 250, imageUrl: 'https://picsum.photos/400/250?random=11', category: 'Workshop', duration: '4 hours', recurring: 'Weekly' },
  { id: 3, title: 'Sunday Stand-up Comedy', date: 'Sun, Aug 25, 7:00 PM', location: 'Central Perk Cafe', price: 300, imageUrl: 'https://picsum.photos/400/250?random=12', category: 'Comedy', duration: '2 hours' },
];

const mockProducts: Product[] = [
    { id: 1, name: 'Handmade Terracotta Horse', seller: 'Shilpi Crafts', price: 1200, imageUrl: 'https://picsum.photos/400/400?random=20', category: 'Handicrafts' },
    { id: 2, name: 'Gorakhpuri Spices Combo', seller: 'Masala Junction', price: 450, imageUrl: 'https://picsum.photos/400/400?random=21', category: 'Food' },
    { id: 3, name: 'Pure Local Honey (500g)', seller: 'Purvanchal Farms', price: 350, imageUrl: 'https://picsum.photos/400/400?random=22', category: 'Food' },
];

const Marketplace: React.FC = () => {
    const { user, openAuthModal } = useAuth();
    const [activeTab, setActiveTab] = useState<'events' | 'products'>('events');
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState<LocalEvent[]>(initialMockEvents);
    const [shareStatus, setShareStatus] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Form state for new event
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        location: '',
        price: '',
        category: '',
        duration: '',
        recurring: 'None',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleTabChange = (tab: 'events' | 'products') => {
        setActiveTab(tab);
        setSearchTerm(''); // Clear search on tab switch
        setSelectedCategory('All'); // Clear category filter
        setShowCreateForm(false); // Hide form on tab switch
    };
    
    useEffect(() => {
        if (shareStatus) {
            const timer = setTimeout(() => setShareStatus(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [shareStatus]);

    const eventCategories = useMemo(() => {
        const categories = new Set(events.map(event => event.category));
        return ['All', ...Array.from(categories)];
    }, [events]);

    const filteredEvents = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return events.filter(event => {
            const categoryMatch = selectedCategory === 'All' || event.category === selectedCategory;
            const searchMatch = event.title.toLowerCase().includes(lowercasedTerm) ||
                                event.category.toLowerCase().includes(lowercasedTerm);
            return categoryMatch && searchMatch;
        });
    }, [searchTerm, events, selectedCategory]);

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
        const status = await shareContent({
          title: event.title,
          text: `Check out this event in Gorakhpur: ${event.title} on ${event.date} at ${event.location}.`,
          url: window.location.href + '#marketplace',
        });
        setShareStatus(status);
    };

    const handleShareProduct = async (product: Product) => {
        const status = await shareContent({
          title: product.name,
          text: `Check out this local product from Gorakhpur: ${product.name} by ${product.seller}.`,
          url: window.location.href + '#marketplace',
        });
        setShareStatus(status);
    };

    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleCreateEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEventData: LocalEvent = {
            id: Date.now(),
            title: newEvent.title,
            date: newEvent.date,
            location: newEvent.location,
            price: Number(newEvent.price),
            category: newEvent.category,
            imageUrl: imagePreview || `https://picsum.photos/400/250?random=${Date.now()}`,
            duration: newEvent.duration,
            recurring: newEvent.recurring === 'None' ? undefined : newEvent.recurring,
        };
        setEvents([newEventData, ...events]);

        // Reset form
        setNewEvent({ title: '', date: '', location: '', price: '', category: '', duration: '', recurring: 'None' });
        setImageFile(null);
        setImagePreview(null);
        setShowCreateForm(false);
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

                <div className="max-w-5xl mx-auto">
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

                    {/* Search and Create Controls */}
                    <div className="mb-4 max-w-lg mx-auto flex flex-col items-center gap-4">
                        <div className="relative w-full">
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
                        {activeTab === 'events' && (
                            user ? (
                                <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-sm">
                                    <PlusIcon /> {showCreateForm ? 'Cancel' : 'Create New Event'}
                                </button>
                            ) : (
                                <div className="text-center p-3 bg-gray-100 rounded-lg text-sm">
                                    <button onClick={() => openAuthModal('login')} className="font-semibold text-orange-600 hover:underline">Login or Sign Up</button> to post your own event!
                                </div>
                            )
                        )}
                    </div>
                    
                     {/* Category Filters */}
                    {activeTab === 'events' && (
                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                        {eventCategories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                selectedCategory === category
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    )}

                    {/* Create Event Form */}
                    {showCreateForm && user && (
                        <div className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-xl shadow-md mb-8 border border-gray-200">
                           <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-center text-gray-800">Create Your Event</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input name="title" value={newEvent.title} onChange={handleFormInputChange} placeholder="Event Title" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                                    <input name="category" value={newEvent.category} onChange={handleFormInputChange} placeholder="Category (e.g., Music)" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                                    <input name="date" value={newEvent.date} onChange={handleFormInputChange} placeholder="Date & Time" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                                    <input name="location" value={newEvent.location} onChange={handleFormInputChange} placeholder="Location" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                                    <input name="price" value={newEvent.price} onChange={handleFormInputChange} type="number" placeholder="Price (0 for free)" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                                    <input name="duration" value={newEvent.duration} onChange={handleFormInputChange} placeholder="Duration (e.g., 2 hours)" className="w-full px-4 py-2 rounded-md border border-gray-300" />
                                    <select name="recurring" value={newEvent.recurring} onChange={handleFormInputChange} className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white">
                                        <option value="None">One-time Event</option>
                                        <option value="Daily">Repeats Daily</option>
                                        <option value="Weekly">Repeats Weekly</option>
                                        <option value="Monthly">Repeats Monthly</option>
                                    </select>
                                    <input type="file" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                                </div>
                                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg max-h-48 mx-auto" />}
                                <div className="flex justify-end gap-4 pt-2">
                                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">Submit Event</button>
                                </div>
                            </form>
                        </div>
                    )}


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
                                            
                                            <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                                                {event.duration && (
                                                    <div className="flex items-center">
                                                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                        <span>{event.duration}</span>
                                                    </div>
                                                )}
                                                {event.recurring && (
                                                    <div className="flex items-center">
                                                        <RefreshIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                        <span>{event.recurring}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <button 
                                                    onClick={() => handleShareEvent(event)}
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors"
                                                    aria-label="Share event"
                                                >
                                                    <ShareIcon className="h-4 w-4" />
                                                    <span>Share</span>
                                                </button>
                                                <div className="flex items-center space-x-3">
                                                    <p className="text-lg font-bold text-gray-800">{event.price > 0 ? `₹${event.price}`: 'Free'}</p>
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
                                <p className="text-gray-600">No events found matching your search criteria.</p>
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
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <button 
                                                    onClick={() => handleShareProduct(product)}
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors"
                                                    aria-label="Share product"
                                                >
                                                    <ShareIcon className="h-4 w-4" />
                                                    <span>Share</span>
                                                </button>
                                                <button onClick={() => handleBuyClick(product.name)} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors">
                                                    Add to Cart
                                                </button>
                                            </div>
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
                    {shareStatus && <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{shareStatus}</div>}
                </div>
            </div>
        </section>
    );
};

export default Marketplace;