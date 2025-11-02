
import React, { useState, useMemo, useEffect } from 'react';
import type { LocalEvent, Product, Review } from '../types';
import { ShoppingCartIcon, TicketIcon, ShareIcon, PlusIcon, ClockIcon, RefreshIcon, PencilIcon, TrashIcon, XIcon, StarIcon, SparklesIcon, LoadingIcon, BookmarkIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { shareContent } from '../utils/share';
import { fileToBase64 } from '../utils/imageUtils';
import { generateDescription } from '../services/geminiService';

// Helper function to get the start of a day
const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    return new Date(dateString).toLocaleString('en-US', options);
}

const FormLabel: React.FC<{htmlFor: string, children: React.ReactNode}> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors" />
);


const Marketplace: React.FC = () => {
    const { user, openAuthModal, addBookmark, removeBookmark, isBookmarked } = useAuth();
    const { addToCart } = useCart();
    const { events, setEvents, products, setProducts } = useContent();

    const [activeTab, setActiveTab] = useState<'events' | 'products'>('events');
    const [searchTerm, setSearchTerm] = useState('');
    const [shareStatus, setShareStatus] = useState('');
    const [cartStatus, setCartStatus] = useState('');
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

    // Events State
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
    const [eventCategory, setEventCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');
    const [eventForm, setEventForm] = useState({ title: '', date: '', location: '', price: '', category: '', duration: '', recurring: 'None', description: '' });
    const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

    // Products State
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productCategory, setProductCategory] = useState('All');
    const [productForm, setProductForm] = useState({ name: '', price: '', category: '', description: '' });
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Review State (for Quick View modal)
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [newReviewComment, setNewReviewComment] = useState('');
    
    // Load recently viewed items from localStorage on initial render
    useEffect(() => {
        try {
            const storedItems = localStorage.getItem('recentlyViewed');
            if (storedItems) {
                setRecentlyViewed(JSON.parse(storedItems));
            }
        } catch (error) {
            console.error("Failed to parse recently viewed items from localStorage", error);
        }
    }, []);

    const handleProductView = (product: Product) => {
        setSelectedProduct(product);
        
        // Update recently viewed items
        const newRecentlyViewed = [
            product,
            ...recentlyViewed.filter(p => p.id !== product.id)
        ].slice(0, 4); // Keep only the last 4 items

        setRecentlyViewed(newRecentlyViewed);
        localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
    };


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
    
    useEffect(() => {
        if (cartStatus) {
            const timer = setTimeout(() => setCartStatus(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [cartStatus]);


    // --- Event Logic ---
    const eventCategories = useMemo(() => Array.from(new Set(['All', ...events.map(event => event.category)])), [events]);
    const dateFilters = ['All', 'Today', 'This Week', 'This Month'];

    const filteredEvents = useMemo(() => {
        const now = new Date();
        const today = getStartOfDay(now);
        const startOfWeek = getStartOfDay(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        return events.filter(event => {
            const categoryMatch = eventCategory === 'All' || event.category === eventCategory;
            const searchMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.category.toLowerCase().includes(searchTerm.toLowerCase());
            
            let dateMatch = true;
            const eventDate = new Date(event.date);

            if (dateFilter === 'Today') {
                dateMatch = eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
            } else if (dateFilter === 'This Week') {
                dateMatch = eventDate >= startOfWeek && eventDate <= endOfWeek;
            } else if (dateFilter === 'This Month') {
                dateMatch = eventDate >= startOfMonth && eventDate <= endOfMonth;
            }

            return categoryMatch && searchMatch && dateMatch;
        });
    }, [searchTerm, events, eventCategory, dateFilter]);

    const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setEventForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleEventImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setEventImagePreview(base64);
        }
    };

    const handleShowEventForm = () => {
        setEditingEvent(null);
        setEventForm({ title: '', date: '', location: '', price: '', category: '', duration: '', recurring: 'None', description: '' });
        setEventImagePreview(null);
        setShowEventForm(true);
    };

    const handleEditEvent = (event: LocalEvent) => {
        setEditingEvent(event);
        // Format date for datetime-local input
        const localDate = new Date(new Date(event.date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setEventForm({
            title: event.title,
            date: localDate,
            location: event.location,
            price: String(event.price),
            category: event.category,
            duration: event.duration || '',
            recurring: event.recurring || 'None',
            description: '' // Assuming events don't have descriptions yet
        });
        setEventImagePreview(event.imageUrl);
        setShowEventForm(true);
    };

    const handleEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            openAuthModal('login');
            return;
        }

        const newEvent: LocalEvent = {
            id: editingEvent ? editingEvent.id : Date.now(),
            title: eventForm.title,
            date: new Date(eventForm.date).toISOString(),
            location: eventForm.location,
            price: Number(eventForm.price),
            imageUrl: eventImagePreview || 'https://picsum.photos/400/250?random=' + Date.now(),
            category: eventForm.category,
            duration: eventForm.duration,
            recurring: eventForm.recurring,
            creatorId: user.id,
            coordinates: { lat: 26.7606, lng: 83.3732 } // Placeholder coordinates
        };

        if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? newEvent : e));
        } else {
            setEvents(prev => [newEvent, ...prev]);
        }
        
        console.log('// SIMULATING PUSH NOTIFICATION: A new event was created. A notification would be sent to subscribed users.');
        
        setShowEventForm(false);
    };
    
    const handleDeleteEvent = (eventId: number) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(prev => prev.filter(e => e.id !== eventId));
        }
    };

    // --- Product Logic ---
    const productCategories = useMemo(() => Array.from(new Set(['All', ...products.map(p => p.category)])), [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const categoryMatch = productCategory === 'All' || product.category === productCategory;
            const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [searchTerm, products, productCategory]);

    const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProductForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setProductImagePreview(base64);
        }
    };

    const handleShowProductForm = () => {
        setEditingProduct(null);
        setProductForm({ name: '', price: '', category: '', description: '' });
        setProductImagePreview(null);
        setShowProductForm(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            price: String(product.price),
            category: product.category,
            description: product.description || '',
        });
        setProductImagePreview(product.imageUrl);
        setShowProductForm(true);
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            openAuthModal('login');
            return;
        }

        const newProduct: Product = {
            id: editingProduct ? editingProduct.id : Date.now(),
            name: productForm.name,
            seller: user.name,
            price: Number(productForm.price),
            imageUrl: productImagePreview || 'https://picsum.photos/400/400?random=' + Date.now(),
            category: productForm.category,
            creatorId: user.id,
            description: productForm.description,
            reviews: editingProduct ? editingProduct.reviews : [],
            coordinates: { lat: 26.7606, lng: 83.3732 } // Placeholder
        };

        if (editingProduct) {
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
        } else {
            setProducts(prev => [newProduct, ...prev]);
        }
        setShowProductForm(false);
    };
    
    const handleDeleteProduct = (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };
    
    const handleAddToCart = (product: Product) => {
        addToCart(product);
        setCartStatus(`'${product.name}' added to cart!`);
    };

    const handleShare = async (item: LocalEvent | Product) => {
        const status = await shareContent({
            title: 'title' in item ? item.title : item.name,
            text: 'title' in item ? `Check out this event: ${item.title}` : `Check out this product: ${item.name}`,
            url: window.location.href + '#marketplace',
        });
        setShareStatus(status);
    };
    
    const handleGenerateDescription = async () => {
        const title = activeTab === 'events' ? eventForm.title : productForm.name;
        const category = activeTab === 'events' ? eventForm.category : productForm.category;
        
        if (!title || !category) {
            alert("Please enter a title and category first.");
            return;
        }

        setIsGeneratingDesc(true);
        const desc = await generateDescription(title, category);
        if (activeTab === 'events') {
            setEventForm(prev => ({...prev, description: desc}));
        } else {
            setProductForm(prev => ({...prev, description: desc}));
        }
        setIsGeneratingDesc(false);
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !user) return;
        const newReview: Review = {
            id: Date.now(),
            author: user.name,
            rating: newReviewRating,
            comment: newReviewComment,
            timestamp: new Date().toISOString()
        };
        const updatedProduct = {
            ...selectedProduct,
            reviews: [newReview, ...(selectedProduct.reviews || [])]
        };
        setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
        setSelectedProduct(updatedProduct);
        setNewReviewComment('');
        setNewReviewRating(0);
    };
    
    return (
        <section id="marketplace" className="py-16 sm:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
                        <ShoppingCartIcon />
                        <span className="ml-3">Gorakhpur Marketplace</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">Discover local events and unique products from our city's creators.</p>
                </div>
                
                <div className="max-w-6xl mx-auto">
                    {/* Tabs */}
                    <div className="flex justify-center border-b border-gray-200 mb-8">
                        <button onClick={() => handleTabChange('events')} className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'events' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Local Events
                        </button>
                        <button onClick={() => handleTabChange('products')} className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'products' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Local Products
                        </button>
                    </div>

                    {/* Filters & Actions */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="relative md:col-span-2">
                             <input
                                type="text"
                                placeholder={`Search ${activeTab === 'events' ? 'events' : 'products'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-gray-700 bg-gray-100 rounded-lg border-2 border-transparent focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        {user ? (
                            <button onClick={activeTab === 'events' ? handleShowEventForm : handleShowProductForm} className="w-full md:w-auto justify-self-end flex items-center justify-center px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all">
                                <PlusIcon />
                                <span className="ml-2">{`Add New ${activeTab === 'events' ? 'Event' : 'Product'}`}</span>
                            </button>
                        ) : (
                            <div className="text-center md:text-right">
                                <p className="text-sm text-gray-600">Want to list your own? <button onClick={() => openAuthModal('login')} className="font-semibold text-orange-600 hover:underline">Log in to create.</button></p>
                            </div>
                        )}
                    </div>
                    
                    {/* Content */}
                    <div>
                        {activeTab === 'events' && (
                            <div>
                                <div className="mb-6 flex flex-wrap gap-2">
                                    <span className="text-sm font-semibold text-gray-700 self-center mr-2">Filter by Date:</span>
                                    {dateFilters.map(filter => (
                                        <button key={filter} onClick={() => setDateFilter(filter)} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${dateFilter === filter ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>{filter}</button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredEvents.map(event => (
                                        <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl group">
                                            <div className="relative">
                                                <img className="h-48 w-full object-cover" src={event.imageUrl} alt={event.title} />
                                                <div className="absolute top-2 right-2 flex items-center gap-2">
                                                     <button onClick={() => {
                                                        const bookmark = { type: 'event' as const, itemId: event.id };
                                                        isBookmarked(bookmark) ? removeBookmark(bookmark) : addBookmark(bookmark);
                                                     }} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-orange-600">
                                                        <BookmarkIcon className={`h-4 w-4 ${isBookmarked({ type: 'event', itemId: event.id }) ? 'text-orange-500 fill-current' : ''}`} />
                                                     </button>
                                                    {user?.id === event.creatorId && (
                                                        <>
                                                            <button onClick={() => handleEditEvent(event)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-blue-600"><PencilIcon/></button>
                                                            <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-red-600"><TrashIcon/></button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-xs font-semibold text-orange-600 uppercase">{event.category}</p>
                                                <h3 className="text-lg font-bold text-gray-800 mt-1 truncate">{event.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{formatDate(event.date)}</p>
                                                <p className="text-sm text-gray-600">{event.location}</p>
                                                <div className="mt-4 flex justify-between items-center">
                                                    <p className="text-lg font-bold text-gray-900">₹{event.price}</p>
                                                    <button onClick={() => alert('Ticket booking functionality coming soon!')} className="flex items-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-md text-sm hover:bg-orange-600 transition-colors">
                                                        <TicketIcon /> <span className="ml-1">Get Ticket</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                           <div>
                                <div className="mb-6 flex flex-wrap gap-2">
                                    <span className="text-sm font-semibold text-gray-700 self-center mr-2">Filter by Category:</span>
                                    {productCategories.map(category => (
                                        <button key={category} onClick={() => setProductCategory(category)} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${productCategory === category ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>{category}</button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredProducts.map(product => (
                                        <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl group flex flex-col">
                                            <div className="relative">
                                                <img className="h-56 w-full object-cover" src={product.imageUrl} alt={product.name} />
                                                <div className="absolute top-2 right-2 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => {
                                                        const bookmark = { type: 'product' as const, itemId: product.id };
                                                        isBookmarked(bookmark) ? removeBookmark(bookmark) : addBookmark(bookmark);
                                                    }} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-orange-600">
                                                        <BookmarkIcon className={`h-4 w-4 ${isBookmarked({ type: 'product', itemId: product.id }) ? 'text-orange-500 fill-current' : ''}`} />
                                                    </button>
                                                    {user?.id === product.creatorId && (
                                                        <>
                                                            <button onClick={() => handleEditProduct(product)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-blue-600"><PencilIcon/></button>
                                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-red-600"><TrashIcon/></button>
                                                        </>
                                                    )}
                                                </div>
                                                <button onClick={() => handleProductView(product)} className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3/4 py-2 bg-white text-sm font-semibold text-gray-800 rounded-lg shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all">Quick View</button>
                                            </div>
                                            <div className="p-4 flex flex-col flex-grow">
                                                <p className="text-xs text-gray-500">{product.category}</p>
                                                <h3 className="text-base font-bold text-gray-800 mt-1 flex-grow">{product.name}</h3>
                                                <div className="mt-4 flex justify-between items-center">
                                                    <p className="text-lg font-bold text-gray-900">₹{product.price}</p>
                                                    <button onClick={() => handleAddToCart(product)} className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors">
                                                        <PlusIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {recentlyViewed.length > 0 && (
                                    <div className="mt-16">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Recently Viewed</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {recentlyViewed.map(product => (
                                                 <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl group flex flex-col">
                                                    <img className="h-40 w-full object-cover" src={product.imageUrl} alt={product.name} />
                                                    <div className="p-4 flex flex-col flex-grow">
                                                        <h3 className="text-sm font-bold text-gray-800 mt-1 flex-grow">{product.name}</h3>
                                                        <div className="mt-4 flex justify-between items-center">
                                                            <p className="text-base font-bold text-gray-900">₹{product.price}</p>
                                                            <button onClick={() => handleProductView(product)} className="text-xs font-semibold text-orange-600 hover:underline">View</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                           </div>
                        )}
                    </div>
                </div>
                
                {/* Modals for Forms */}
                {(showEventForm || showProductForm) && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setShowEventForm(false); setShowProductForm(false); }}>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between p-6 border-b">
                                <h2 className="text-2xl font-bold text-gray-900">{showEventForm ? (editingEvent ? 'Edit Event' : 'Add New Event') : (editingProduct ? 'Edit Product' : 'Add New Product')}</h2>
                                <button onClick={() => { setShowEventForm(false); setShowProductForm(false); }} className="text-gray-400 hover:text-gray-600 transition-colors"><XIcon /></button>
                            </div>
                            {showEventForm && (
                                <form onSubmit={handleEventSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><FormLabel htmlFor="title">Event Title</FormLabel><FormInput type="text" name="title" id="title" value={eventForm.title} onChange={handleEventFormChange} required /></div>
                                        <div><FormLabel htmlFor="category">Category</FormLabel><FormInput type="text" name="category" id="category" value={eventForm.category} onChange={handleEventFormChange} placeholder="e.g., Music, Workshop" required /></div>
                                    </div>
                                    <div><FormLabel htmlFor="location">Location</FormLabel><FormInput type="text" name="location" id="location" value={eventForm.location} onChange={handleEventFormChange} required /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><FormLabel htmlFor="date">Date & Time</FormLabel><FormInput type="datetime-local" name="date" id="date" value={eventForm.date} onChange={handleEventFormChange} required /></div>
                                        <div><FormLabel htmlFor="price">Price (₹)</FormLabel><FormInput type="number" name="price" id="price" value={eventForm.price} onChange={handleEventFormChange} placeholder="Enter 0 for free event" required /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><FormLabel htmlFor="duration">Duration</FormLabel><FormInput type="text" name="duration" id="duration" value={eventForm.duration} onChange={handleEventFormChange} placeholder="e.g., 3 hours" /></div>
                                        <div><FormLabel htmlFor="recurring">Recurring</FormLabel><FormSelect name="recurring" id="recurring" value={eventForm.recurring} onChange={handleEventFormChange}><option>None</option><option>Daily</option><option>Weekly</option><option>Monthly</option></FormSelect></div>
                                    </div>
                                     <div>
                                        <FormLabel htmlFor="event-image-upload">Event Image</FormLabel>
                                        <div className="mt-1 flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                                            {eventImagePreview ? (<img src={eventImagePreview} alt="Event preview" className="h-24 w-24 object-cover rounded-md"/>) : (<div className="h-24 w-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><TicketIcon /></div>)}
                                            <div>
                                                <input type="file" id="event-image-upload" className="hidden" onChange={handleEventImageChange} accept="image/*" />
                                                <label htmlFor="event-image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">Change</label>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">Save Event</button></div>
                                </form>
                            )}
                            {showProductForm && (
                                <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><FormLabel htmlFor="name">Product Name</FormLabel><FormInput type="text" name="name" id="name" value={productForm.name} onChange={handleProductFormChange} required /></div>
                                        <div><FormLabel htmlFor="category">Category</FormLabel><FormInput type="text" name="category" id="category" value={productForm.category} onChange={handleProductFormChange} placeholder="e.g., Handicrafts, Food" required /></div>
                                    </div>
                                    <div><FormLabel htmlFor="price">Price (₹)</FormLabel><FormInput type="number" name="price" id="price" value={productForm.price} onChange={handleProductFormChange} required /></div>
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <FormLabel htmlFor="description">Description</FormLabel>
                                            <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-xs flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-800 disabled:opacity-50">
                                                {isGeneratingDesc ? <LoadingIcon /> : <SparklesIcon />}
                                                Generate with AI
                                            </button>
                                        </div>
                                        <textarea name="description" id="description" value={productForm.description} onChange={handleProductFormChange} rows={4} className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <FormLabel htmlFor="product-image-upload">Product Image</FormLabel>
                                        <div className="mt-1 flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                                            {productImagePreview ? (<img src={productImagePreview} alt="Product preview" className="h-24 w-24 object-cover rounded-md"/>) : (<div className="h-24 w-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><ShoppingCartIcon /></div>)}
                                            <div>
                                                <input type="file" id="product-image-upload" className="hidden" onChange={handleProductImageChange} accept="image/*" />
                                                <label htmlFor="product-image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">Change</label>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">Save Product</button></div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Product Quick View Modal */}
                {selectedProduct && (
                     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                            <div className="w-full md:w-1/2">
                                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"/>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col">
                                <div className="p-6 pb-0 flex-grow overflow-y-auto">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-orange-600">{selectedProduct.category}</p>
                                            <h2 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">Sold by {selectedProduct.seller}</p>
                                        </div>
                                        <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-800 my-4">₹{selectedProduct.price.toFixed(2)}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">{selectedProduct.description}</p>
                                    
                                    <div className="mt-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Reviews ({selectedProduct.reviews?.length || 0})</h4>
                                        <div className="space-y-4">
                                            {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                                                selectedProduct.reviews.slice(0, 2).map(review => (
                                                    <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-semibold text-sm text-gray-800">{review.author}</p>
                                                            <div className="flex items-center">{[...Array(review.rating)].map((_, i) => <StarIcon key={i} className="h-4 w-4 text-yellow-400"/>)}{[...Array(5 - review.rating)].map((_, i) => <StarIcon key={i} className="h-4 w-4 text-gray-300"/>)}</div>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
                                                    </div>
                                                ))
                                            ) : <p className="text-sm text-gray-500">No reviews yet.</p>}
                                        </div>
                                    </div>
                                    
                                    {user && (
                                        <form onSubmit={handleReviewSubmit} className="mt-6 bg-gray-50 p-4 rounded-lg">
                                            <h5 className="font-semibold text-gray-800 mb-2">Leave a Review</h5>
                                            <div className="flex items-center mb-2">
                                                {[1,2,3,4,5].map(star => <button key={star} type="button" onClick={() => setNewReviewRating(star)}><StarIcon className={`h-6 w-6 ${newReviewRating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}/></button>)}
                                            </div>
                                            <textarea value={newReviewComment} onChange={e => setNewReviewComment(e.target.value)} rows={2} placeholder="Share your thoughts..." className="w-full p-2 text-sm text-gray-700 bg-white rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"></textarea>
                                            <button type="submit" disabled={!newReviewRating || !newReviewComment} className="mt-2 w-full text-center py-2 px-4 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-md">Submit Review</button>
                                        </form>
                                    )}
                                </div>
                                <div className="p-6 mt-auto border-t">
                                    <button onClick={() => {handleAddToCart(selectedProduct); setSelectedProduct(null);}} className="w-full py-3 px-4 bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600">Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>
            {shareStatus && <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{shareStatus}</div>}
            {cartStatus && <div className="fixed bottom-5 left-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-up">{cartStatus}</div>}
        </section>
    );
};

export default Marketplace;