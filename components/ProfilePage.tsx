
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { TrashIcon, UserCircleIcon, TicketIcon, ShoppingCartIcon, NewspaperIcon } from './icons';

const NotificationToggle: React.FC<{ label: string; description: string; enabled: boolean; onChange: (enabled: boolean) => void;}> = ({ label, description, enabled, onChange }) => (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div>
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <label htmlFor={`toggle-${label}`} className="flex items-center cursor-pointer select-none">
            <div className="relative">
                <input type="checkbox" id={`toggle-${label}`} className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-full' : ''}`}></div>
            </div>
        </label>
    </div>
);


const ProfilePage: React.FC = () => {
    const { user, updateNotificationPreferences } = useAuth();
    const { posts, setPosts, events, setEvents, products, setProducts } = useContent();
    const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'products'>('posts');

    const myPosts = useMemo(() => posts.filter(post => post.creatorId === user?.id), [posts, user]);
    const myEvents = useMemo(() => events.filter(event => event.creatorId === user?.id), [events, user]);
    const myProducts = useMemo(() => products.filter(product => product.creatorId === user?.id), [products, user]);
    
    // In a real app, these would call an API. Here we just update context state.
    const handleDeletePost = (postId: number) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(prev => prev.filter(p => p.id !== postId));
        }
    };
    
    const handleDeleteEvent = (eventId: number) => {
         if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(prev => prev.filter(e => e.id !== eventId));
        }
    };

    const handleDeleteProduct = (productId: number) => {
         if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    const handlePreferenceChange = (key: 'newPosts' | 'newEvents', value: boolean) => {
        if (user && user.notificationPreferences) {
            const newPrefs = {
                ...user.notificationPreferences,
                [key]: value,
            };
            updateNotificationPreferences(newPrefs);
        }
    };

    if (!user) {
        return null;
    }
    
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };
        return new Date(dateString).toLocaleString('en-US', options);
    }

    return (
        <section id="profile" className="py-16 sm:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row items-center bg-gray-50 p-8 rounded-2xl shadow-sm text-center sm:text-left">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-24 w-24 rounded-full border-4 border-white shadow-md mb-4 sm:mb-0 sm:mr-6 flex-shrink-0" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                                <UserCircleIcon />
                            </div>
                        )}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Notification Settings</h3>
                        <p className="text-sm text-gray-600 mb-6">Choose what you want to be notified about.</p>
                        <div className="space-y-4">
                            <NotificationToggle
                                label="New Community Posts"
                                description="Get notified when someone posts on the bulletin board."
                                enabled={user.notificationPreferences?.newPosts ?? true}
                                onChange={(enabled) => handlePreferenceChange('newPosts', enabled)}
                            />
                            <NotificationToggle
                                label="New Local Events"
                                description="Receive alerts for new events listed in the marketplace."
                                enabled={user.notificationPreferences?.newEvents ?? true}
                                onChange={(enabled) => handlePreferenceChange('newEvents', enabled)}
                            />
                        </div>
                    </div>

                    {/* Content Tabs */}
                    <div>
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`${activeTab === 'posts' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <NewspaperIcon /> <span className="ml-2">My Posts ({myPosts.length})</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('events')}
                                    className={`${activeTab === 'events' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <TicketIcon /> <span className="ml-2">My Events ({myEvents.length})</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`${activeTab === 'products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <ShoppingCartIcon className="h-5 w-5" /> <span className="ml-2">My Products ({myProducts.length})</span>
                                </button>
                            </nav>
                        </div>

                        {/* Content Display */}
                        <div className="space-y-6">
                            {activeTab === 'posts' && (
                                myPosts.length > 0 ? myPosts.map(post => (
                                    <div key={post.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-x-3 mb-1">
                                                <h4 className="font-bold text-gray-800">{post.title}</h4>
                                                <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{post.category}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{post.content.substring(0, 100)}...</p>
                                            <p className="text-xs text-gray-400 mt-2">{post.timestamp}</p>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                            <button onClick={() => handleDeletePost(post.id)} title="Delete post" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">You haven't created any posts yet.</p>
                            )}

                            {activeTab === 'events' && (
                                myEvents.length > 0 ? myEvents.map(event => (
                                    <div key={event.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                       <div className="flex items-center">
                                         <img src={event.imageUrl} alt={event.title} className="h-16 w-16 rounded-md object-cover mr-4"/>
                                         <div>
                                            <h4 className="font-bold text-gray-800">{event.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{formatDate(event.date)} @ {event.location}</p>
                                            <p className="text-sm text-gray-600 font-semibold">₹{event.price}</p>
                                        </div>
                                       </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                            <button onClick={() => handleDeleteEvent(event.id)} title="Delete event" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">You haven't created any events yet.</p>
                            )}

                             {activeTab === 'products' && (
                                myProducts.length > 0 ? myProducts.map(product => (
                                    <div key={product.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                       <div className="flex items-center">
                                         <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-md object-cover mr-4"/>
                                         <div>
                                            <h4 className="font-bold text-gray-800">{product.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                                            <p className="text-sm text-gray-600 font-semibold">₹{product.price}</p>
                                        </div>
                                       </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                            <button onClick={() => handleDeleteProduct(product.id)} title="Delete product" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">You haven't listed any products yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;