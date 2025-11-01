
import React, { useState, useMemo, useEffect } from 'react';
import type { LocalEvent, Product } from '../types';
import { ShoppingCartIcon, TicketIcon, ShareIcon, PlusIcon, ClockIcon, RefreshIcon, PencilIcon, TrashIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { shareContent } from '../utils/share';

const initialMockEvents: LocalEvent[] = [
  { id: 1, title: 'Live Music Night at The Brew House', date: 'Sat, Aug 24, 8:00 PM', location: 'The Brew House, Golghar', price: 499, imageUrl: 'https://picsum.photos/400/250?random=10', category: 'Music', duration: '3 hours', creatorId: '99999' }, // Not editable by mock user
  { id: 2, title: 'Gorakhpur Terracotta Workshop', date: 'Sun, Aug 25, 11:00 AM', location: 'Craft Village, Taramandal', price: 250, imageUrl: 'https://picsum.photos/400/250?random=11', category: 'Workshop', duration: '4 hours', recurring: 'Weekly', creatorId: '67890' }, // Editable by mock user
  { id: 3, title: 'Sunday Stand-up Comedy', date: 'Sun, Aug 25, 7:00 PM', location: 'Central Perk Cafe', price: 300, imageUrl: 'https://picsum.photos/400/250?random=12', category: 'Comedy', duration: '2 hours', creatorId: '99999' },
];

const initialMockProducts: Product[] = [
    { id: 1, name: 'Handmade Terracotta Horse', seller: 'Shilpi Crafts', price: 1200, imageUrl: 'https://picsum.photos/400/400?random=20', category: 'Handicrafts', creatorId: '67890' }, // Editable by mock user
    { id: 2, name: 'Gorakhpuri Spices Combo', seller: 'Masala Junction', price: 450, imageUrl: 'https://picsum.photos/400/400?random=21', category: 'Food', creatorId: '99999' },
    { id: 3, name: 'Pure Local Honey (500g)', seller: 'Purvanchal Farms', price: 350, imageUrl: 'https://picsum.photos/400/400?random=22', category: 'Food', creatorId: '99999' },
];


const Marketplace: React.FC = () => {
    const { user, openAuthModal } = useAuth();
    const [activeTab, setActiveTab] = useState<'events' | 'products'>('events');
    const [searchTerm, setSearchTerm] = useState('');
    const [shareStatus, setShareStatus] = useState('');

    // Events State
    const [events, setEvents] = useState<LocalEvent[]>(initialMockEvents);
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
    const [eventCategory, setEventCategory] = useState('All');
    const [eventForm, setEventForm] = useState({ title: '', date: '', location: '', price: '', category: '', duration: '', recurring: 'None' });
    const [eventImageFile, setEventImageFile] = useState<File | null>(null);
    const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

    // Products State
    const [products, setProducts] = useState<Product[]>(initialMockProducts);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({ name: '', price: '', category: '' });
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);


    const handleTabChange = (tab: 'events' | 'products') => {
        setActiveTab(tab);
        setSearchTerm('');
        setShowEventForm(false);
        setEditingEvent(null);
        setShowProductForm(false);
        setEditingProduct(null);
    };
    
    useEffect(() => {
        if (shareStatus) {
            const timer = setTimeout(() => setShareStatus(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [shareStatus]);

    // --- Event Logic ---
    const eventCategories = useMemo(() => new Set(['All', ...events.map(event => event.category)]), [events]);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const categoryMatch = eventCategory === 'All' || event.category === eventCategory;
            const searchMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.category.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [searchTerm, events, eventCategory]);

    const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setEventForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEventImageFile(file);
            setEventImagePreview(URL.createObjectURL(file));
        }
    };

    const handleShowEventForm = () => {
        setEditingEvent(null);
        setEventForm({ title: '', date: '', location: '', price: '', category: '', duration: '', recurring: 'None' });
        setEventImageFile(null);
        setEventImagePreview(null);
        setShowEventForm(true);
    };

    const handleEditEvent = (event: LocalEvent) => {
        setEditingEvent(event);
        setEventForm({
            title: event.title,
            date: event.date,
            location: event.location,
            price: String(event.price),
            category: event.category,
            duration: event.duration || '',
            recurring: event.recurring || 'None',
        });
        setEventImagePreview(event.imageUrl);
        setShowEventForm(true);
    };
    
    const handleDeleteEvent = (eventId: number) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(events.filter(event => event.id !== eventId));
        }
    };

    const handleEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (editingEvent) { // Update existing event
            const updatedEvent: LocalEvent = {
                ...editingEvent,
                ...eventForm,
                price: Number(eventForm.price),
                imageUrl: eventImagePreview || editingEvent.imageUrl,
                duration: eventForm.duration || undefined,
                recurring: eventForm.recurring === 'None' ? undefined : eventForm.recurring,
            };
            setEvents(events.map(event => event.id === editingEvent.id ? updatedEvent : event));
        } else { // Create new event
            const newEventData: LocalEvent = {
                id: Date.now(),
                ...eventForm,
                price: Number(eventForm.price),
                imageUrl: eventImagePreview || `https://picsum.photos/400/250?random=${Date.now()}`,
                duration: eventForm.duration || undefined,
                recurring: eventForm.recurring === 'None' ? undefined : eventForm.recurring,
                creatorId: user.id,
            };
            setEvents([newEventData, ...events]);
        }
        setShowEventForm(false);
        setEditingEvent(null);
    };

    // --- Product Logic ---
    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);
    
    const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setProductForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImageFile(file);
            setProductImagePreview(URL.createObjectURL(file));
        }
    };

    const handleShowProductForm = () => {
        setEditingProduct(null);
        setProductForm({ name: '', price: '', category: '' });
        setProductImageFile(null);
        setProductImagePreview(null);
        setShowProductForm(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            price: String(product.price),
            category: product.category,
        });
        setProductImagePreview(product.imageUrl);
        setShowProductForm(true);
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (editingProduct) {
            const updatedProduct: Product = {
                ...editingProduct,
                ...productForm,
                price: Number(productForm.price),
                imageUrl: productImagePreview || editingProduct.imageUrl,
            };
            setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
        } else {
            const newProductData: Product = {
                id: Date.now(),
                seller: user.name,
                ...productForm,
                price: Number(productForm.price),
                imageUrl: productImagePreview || `https://picsum.photos/400/400?random=${Date.now()}`,
                creatorId: user.id,
            };
            setProducts([newProductData, ...products]);
        }
        setShowProductForm(false);
        setEditingProduct(null);
    };

    // --- Common Logic ---
    const handleBuyClick = (itemName: string) => alert(`Thank you for your interest in ${itemName}! Full checkout functionality is coming soon.`);

    const handleShare = async (title: string, text: string) => {
        const status = await shareContent({ title, text, url: window.location.href + '#marketplace' });
        setShareStatus(status);
    };
    
    const renderForm = (
        isProduct: boolean,
        formState: any,
        handleChange: any,
        handleSubmit: any,
        handleImageChange: any,
        imagePreview: string | null,
        setShowForm: (show: boolean) => void,
        editingItem: any
    ) => (
        <div className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-xl shadow-md mb-8 border border-gray-200">
           <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-center text-gray-800">{editingItem ? `Edit Your ${isProduct ? 'Product' : 'Event'}` : `Create Your ${isProduct ? 'Product' : 'Event'}`}</h3>
                {isProduct ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input name="name" value={formState.name} onChange={handleChange} placeholder="Product Name" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                        <input name="category" value={formState.category} onChange={handleChange} placeholder="Category (e.g., Handicrafts)" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                        <input name="price" value={formState.price} onChange={handleChange} type="number" placeholder="Price" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input name="title" value={formState.title} onChange={handleChange} placeholder="Event Title" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                        <input name="category" value={formState.category} onChange={handleChange} placeholder="Category (e.g., Music)" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                        <input name="date" value={formState.date} onChange={handleChange} placeholder="Date & Time" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                        <input name="location" value={formState.location} onChange={handleChange} placeholder="Location" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                        <input name="price" value={formState.price} onChange={handleChange} type="number" placeholder="Price (0 for free)" className="w-full px-4 py-2 rounded-md border border-gray-300" required />
                        <input name="duration" value={formState.duration} onChange={handleChange} placeholder="Duration (e.g., 2 hours)" className="w-full px-4 py-2 rounded-md border border-gray-300" />
                        <select name="recurring" value={formState.recurring} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white"><option value="None">One-time Event</option><option value="Daily">Repeats Daily</option><option value="Weekly">Repeats Weekly</option><option value="Monthly">Repeats Monthly</option></select>
                    </div>
                )}
                <input type="file" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg max-h-48 mx-auto" />}
                <div className="flex justify-end gap-4 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">{editingItem ? 'Update' : 'Submit'}</button>
                </div>
            </form>
        </div>
    );

    return (
        <section id="marketplace" className="py-16 sm:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center"><ShoppingCartIcon /><span className="ml-3">Gorakhpur Marketplace</span></h2><p className="mt-4 text-lg text-gray-600">Discover local events and products, all in one place.</p></div>
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex justify-center border-b border-gray-200">
                        <button onClick={() => handleTabChange('events')} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'events' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Events & Tickets</button>
                        <button onClick={() => handleTabChange('products')} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'products' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Local Products</button>
                    </div>

                    <div className="mb-4 max-w-lg mx-auto flex flex-col items-center gap-4">
                        <div className="relative w-full">
                            <input type="text" placeholder={`Search for ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 text-gray-700 bg-gray-100 rounded-full border-2 border-transparent focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors" />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                        </div>
                        
                        {user ? (
                            activeTab === 'events' ? (
                                <button onClick={() => showEventForm ? setShowEventForm(false) : handleShowEventForm()} className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-sm"><PlusIcon /> {showEventForm ? 'Cancel' : 'Create New Event'}</button>
                            ) : (
                                <button onClick={() => showProductForm ? setShowProductForm(false) : handleShowProductForm()} className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-sm"><PlusIcon /> {showProductForm ? 'Cancel' : 'Sell Your Product'}</button>
                            )
                        ) : (
                            <div className="text-center p-3 bg-gray-100 rounded-lg text-sm"><button onClick={() => openAuthModal('login')} className="font-semibold text-orange-600 hover:underline">Login or Sign Up</button> to post your own {activeTab === 'events' ? 'event' : 'product'}!</div>
                        )}
                    </div>
                    
                    {activeTab === 'events' && (
                        <div className="mb-8 flex flex-wrap justify-center gap-2">
                            {Array.from(eventCategories).map(category => (<button key={category} onClick={() => setEventCategory(category)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${eventCategory === category ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{category}</button>))}
                        </div>
                    )}
                    
                    {showEventForm && user && renderForm(false, eventForm, handleEventFormChange, handleEventSubmit, handleEventImageChange, eventImagePreview, setShowEventForm, editingEvent)}
                    {showProductForm && user && renderForm(true, productForm, handleProductFormChange, handleProductSubmit, handleProductImageChange, productImagePreview, setShowProductForm, editingProduct)}
                    
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
                                                {event.duration && <div className="flex items-center"><ClockIcon className="h-4 w-4 mr-1 text-gray-400" /><span>{event.duration}</span></div>}
                                                {event.recurring && <div className="flex items-center"><RefreshIcon className="h-4 w-4 mr-1 text-gray-400" /><span>{event.recurring}</span></div>}
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => handleShare(event.title, `Check out this event: ${event.title}`)} className="p-2 text-gray-600 hover:text-orange-600" aria-label="Share event"><ShareIcon className="h-4 w-4" /></button>
                                                    {user && user.id === event.creatorId && <>
                                                        <button onClick={() => handleEditEvent(event)} className="p-2 text-gray-600 hover:text-blue-600" aria-label="Edit event"><PencilIcon /></button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-gray-600 hover:text-red-600" aria-label="Delete event"><TrashIcon /></button>
                                                    </>}
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <p className="text-lg font-bold text-gray-800">{event.price > 0 ? `₹${event.price}`: 'Free'}</p>
                                                    <button onClick={() => handleBuyClick(event.title)} className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors"><TicketIcon />Buy Tickets</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredEvents.length === 0 && <div className="col-span-full text-center py-10"><p className="text-gray-600">No events found matching your search criteria.</p></div>}
                            </div>
                        )}
                        {activeTab === 'products' && (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col text-center">
                                        <div className="p-4 bg-gray-100"><img className="h-48 w-48 object-cover rounded-lg mx-auto" src={product.imageUrl} alt={product.name} /></div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1 mb-3 flex-grow">by {product.seller}</p>
                                            <p className="text-xl font-bold text-gray-800 mb-4">₹{product.price}</p>
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                                 <div className="flex items-center space-x-2">
                                                    <button onClick={() => handleShare(product.name, `Check out this product: ${product.name}`)} className="p-2 text-gray-600 hover:text-orange-600" aria-label="Share product"><ShareIcon className="h-4 w-4" /></button>
                                                    {user && user.id === product.creatorId && <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-600 hover:text-blue-600" aria-label="Edit product"><PencilIcon /></button>}
                                                </div>
                                                <button onClick={() => handleBuyClick(product.name)} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors">Add to Cart</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && <div className="col-span-full text-center py-10"><p className="text-gray-600">No products found matching your search.</p></div>}
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
