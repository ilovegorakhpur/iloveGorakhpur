
import React, { useState, useMemo, useEffect } from 'react';
import type { LocalEvent, Product, Review } from '../types';
import { ShoppingCartIcon, TicketIcon, ShareIcon, PlusIcon, ClockIcon, RefreshIcon, PencilIcon, TrashIcon, XIcon, StarIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { shareContent } from '../utils/share';

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

const Marketplace: React.FC = () => {
    const { user, openAuthModal } = useAuth();
    const { addToCart } = useCart();
    const { events, setEvents, products, setProducts } = useContent();

    const [activeTab, setActiveTab] = useState<'events' | 'products'>('events');
    const [searchTerm, setSearchTerm] = useState('');
    const [shareStatus, setShareStatus] = useState('');
    const [cartStatus, setCartStatus] = useState('');

    // Events State
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
    const [eventCategory, setEventCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');
    const [eventForm, setEventForm] = useState({ title: '', date: '', location: '', price: '', category: '', duration: '', recurring: 'None' });
    const [eventImageFile, setEventImageFile] = useState<File | null>(null);
    const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

    // Products State
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productCategory, setProductCategory] = useState('All');
    const [productForm, setProductForm] = useState({ name: '', price: '', category: '', description: '' });
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Review State (for Quick View modal)
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [newReviewComment, setNewReviewComment] = useState('');


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
        // Format date for datetime-local input
        const localDate = new Date(event.date).toISOString().slice(0, 16);
        setEventForm({
            title: event.title,
            date: localDate,
            location: event.location,
            price: String(event.price),
            category: event.category,
            duration: event.duration || '',
            recurring: event.recurring || 'None'
        });
        setEventImagePreview(event.imageUrl);
        setEventImageFile(null);
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
        };

        if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? newEvent : e));
        } else {
            setEvents(prev => [newEvent, ...prev]);
        }
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

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImageFile(file);
            setProductImagePreview(URL.createObjectURL(file));
        }
    };

    const handleShowProductForm = () => {
        setEditingProduct(null);
        setProductForm({ name: '', price: '', category: '', description: '' });
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
            description: product.description || '',
        });
        setProductImagePreview(product.imageUrl);
        setProductImageFile(null);
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
        setNewReviewRating(0);
        setNewReviewComment('');
    };
    
    const renderStars = (rating: number, setRating?: (r: number) => void) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type={setRating ? 'button' : undefined} onClick={setRating ? () => setRating(star) : undefined} className={`${setRating ? 'cursor-pointer' : ''}`}>
                         <StarIcon className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                ))}
            </div>
        );
    };

    const averageRating = (reviews: Review[] = []) => {
        if (!reviews || reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return parseFloat((total / reviews.length).toFixed(1));
    };

    return (
        <section id="marketplace" className="py-16 sm:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
                        <ShoppingCartIcon className="h-8 w-8 text-orange-500" />
                        <span className="ml-3">Gorakhpur Marketplace</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">Discover local events and unique products from our city's creators.</p>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Tabs */}
                    <div className="mb-8 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
                            <button onClick={() => handleTabChange('events')} className={`${activeTab === 'events' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                                <TicketIcon /> <span className="ml-2">Local Events</span>
                            </button>
                            <button onClick={() => handleTabChange('products')} className={`${activeTab === 'products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                                <ShoppingCartIcon className="h-5 w-5" /> <span className="ml-2">Local Products</span>
                            </button>
                        </nav>
                    </div>

                    {/* Filters and Actions */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="relative md:col-span-2">
                             <input type="text" placeholder={`Search for ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 text-gray-700 bg-white rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors" />
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <div className="text-right">
                           {user ? (
                                <button onClick={activeTab === 'events' ? handleShowEventForm : handleShowProductForm} className="w-full md:w-auto flex items-center justify-center px-5 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-colors">
                                    <PlusIcon /> <span className="ml-2">Add New {activeTab === 'events' ? 'Event' : 'Product'}</span>
                                </button>
                           ) : (
                                <button onClick={() => openAuthModal('login')} className="w-full md:w-auto px-5 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-colors">
                                    Login to Add Your Listing
                                </button>
                           )}
                        </div>
                    </div>
                    <div className="mb-8 flex flex-wrap gap-2">
                        {activeTab === 'events' && dateFilters.map(filter => (
                            <button key={filter} onClick={() => setDateFilter(filter)} className={`px-4 py-2 text-sm font-medium rounded-full ${dateFilter === filter ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{filter}</button>
                        ))}
                    </div>

                    {/* Content Grid */}
                    {activeTab === 'events' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map(event => (
                                <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
                                    <img className="h-48 w-full object-cover" src={event.imageUrl} alt={event.title} />
                                    <div className="p-4 flex flex-col flex-grow">
                                        <p className="text-sm font-semibold text-orange-600">{event.category}</p>
                                        <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 flex-grow">{event.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{formatDate(event.date)}</p>
                                        <p className="text-sm text-gray-700 mb-4">{event.location}</p>
                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <p className="text-lg font-bold text-gray-800">{event.price > 0 ? `₹${event.price}` : 'Free'}</p>
                                            <div className="flex items-center gap-1">
                                                {user?.id === event.creatorId && (
                                                    <>
                                                        <button onClick={() => handleEditEvent(event)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Edit Event"><PencilIcon /></button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete Event"><TrashIcon /></button>
                                                    </>
                                                )}
                                                <button onClick={() => handleShare(event)} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full" title="Share Event"><ShareIcon className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                     {activeTab === 'products' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col group">
                                    <div className="relative">
                                        <img className="h-56 w-full object-cover" src={product.imageUrl} alt={product.name} />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => setSelectedProduct(product)} className="px-4 py-2 bg-white/80 text-black font-semibold rounded-full backdrop-blur-sm">Quick View</button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">{product.category}</p>
                                        <h3 className="text-base font-bold text-gray-800 mt-1 flex-grow">{product.name}</h3>
                                        <p className="text-sm text-gray-500">by {product.seller}</p>
                                        <div className="flex items-center mt-2">
                                            {renderStars(averageRating(product.reviews))}
                                            <span className="text-xs text-gray-500 ml-2">({product.reviews?.length || 0})</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <p className="text-lg font-bold text-gray-900">₹{product.price}</p>
                                            <button onClick={() => handleAddToCart(product)} className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                                                <PlusIcon />
                                            </button>
                                        </div>
                                         {user?.id === product.creatorId && (
                                            <div className="mt-2 flex items-center justify-end gap-1">
                                                <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Edit Product"><PencilIcon className="h-3 w-3"/></button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete Product"><TrashIcon className="h-3 w-3"/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {(activeTab === 'events' && filteredEvents.length === 0) && (
                         <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800">No Events Found</h3>
                            <p className="text-gray-600 mt-2">Try a different search or filter, or be the first to add one!</p>
                        </div>
                    )}
                     {(activeTab === 'products' && filteredProducts.length === 0) && (
                         <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800">No Products Found</h3>
                            <p className="text-gray-600 mt-2">Try a different search or filter, or be the first to add one!</p>
                        </div>
                    )}
                </div>
                
                {/* Modals and Status Popups */}
                {showEventForm && (
                     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowEventForm(false)}>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowEventForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon /></button>
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingEvent ? 'Edit Event' : 'Create a New Event'}</h2>
                                <form onSubmit={handleEventSubmit} className="space-y-4">
                                     <input name="title" value={eventForm.title} onChange={handleEventFormChange} placeholder="Event Title" className="w-full p-2 border rounded" required />
                                     <input name="date" type="datetime-local" value={eventForm.date} onChange={handleEventFormChange} className="w-full p-2 border rounded" required />
                                     <input name="location" value={eventForm.location} onChange={handleEventFormChange} placeholder="Location" className="w-full p-2 border rounded" required />
                                     <input name="price" type="number" value={eventForm.price} onChange={handleEventFormChange} placeholder="Price (0 for free)" className="w-full p-2 border rounded" required />
                                     <input name="category" value={eventForm.category} onChange={handleEventFormChange} placeholder="Category (e.g., Music, Workshop)" className="w-full p-2 border rounded" required />
                                     <button type="submit" className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600">{editingEvent ? 'Update Event' : 'Create Event'}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {showProductForm && (
                     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowProductForm(false)}>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                           <button onClick={() => setShowProductForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon /></button>
                             <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingProduct ? 'Edit Product' : 'Add a New Product'}</h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">
                                    <input name="name" value={productForm.name} onChange={handleProductFormChange} placeholder="Product Name" className="w-full p-2 border rounded" required />
                                    <input name="price" type="number" value={productForm.price} onChange={handleProductFormChange} placeholder="Price" className="w-full p-2 border rounded" required />
                                    <input name="category" value={productForm.category} onChange={handleProductFormChange} placeholder="Category (e.g., Handicrafts, Food)" className="w-full p-2 border rounded" required />
                                    <textarea name="description" value={productForm.description} onChange={handleProductFormChange} placeholder="Product Description" className="w-full p-2 border rounded" rows={3}></textarea>
                                     <button type="submit" className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {selectedProduct && (
                     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                           <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><XIcon /></button>
                           <div className="w-full md:w-1/2">
                             <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover rounded-l-2xl" />
                           </div>
                           <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                                <h2 className="text-3xl font-bold">{selectedProduct.name}</h2>
                                <p className="text-gray-500 text-sm mb-4">by {selectedProduct.seller}</p>
                                <div className="flex items-center mb-4">
                                    {renderStars(averageRating(selectedProduct.reviews))}
                                    <span className="text-sm text-gray-500 ml-2">{averageRating(selectedProduct.reviews)} ({selectedProduct.reviews?.length || 0} reviews)</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-4">₹{selectedProduct.price}</p>
                                <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
                                <button onClick={() => handleAddToCart(selectedProduct)} className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600">Add to Cart</button>
                                <div className="mt-8">
                                    <h3 className="font-bold text-lg mb-4">Reviews</h3>
                                    {user && (
                                        <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-semibold mb-2">Leave a review</h4>
                                            <div className="mb-2">{renderStars(newReviewRating, setNewReviewRating)}</div>
                                            <textarea value={newReviewComment} onChange={e => setNewReviewComment(e.target.value)} placeholder="Your comment..." className="w-full p-2 border rounded mb-2" required></textarea>
                                            <button type="submit" className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md">Submit</button>
                                        </form>
                                    )}
                                    <div className="space-y-4 max-h-60 overflow-y-auto">
                                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? selectedProduct.reviews.map(review => (
                                            <div key={review.id} className="border-b pb-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">{review.author}</span>
                                                    {renderStars(review.rating)}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                                            </div>
                                        )) : <p className="text-sm text-gray-500">No reviews yet.</p>}
                                    </div>
                                </div>
                           </div>
                        </div>
                    </div>
                )}

                {shareStatus && <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{shareStatus}</div>}
                {cartStatus && <div className="fixed bottom-16 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{cartStatus}</div>}
            </div>
        </section>
    );
};

export default Marketplace;
