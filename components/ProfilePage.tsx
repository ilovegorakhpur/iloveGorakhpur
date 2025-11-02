/*
 * Copyright (c) 2024, iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { PencilIcon, TrashIcon, UserCircleIcon, TicketIcon, ShoppingCartIcon, NewspaperIcon, BookmarkIcon, SparklesIcon, CalendarIcon, ChevronDownIcon, HeartIcon, CheckCircleIcon } from './icons';
import type { Post, LocalEvent, Product, Article, Itinerary } from '../types';
import EditProfileModal from './EditProfileModal';
import AISuggestions from './AISuggestions';


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

const SavedItineraryCard: React.FC<{
    itinerary: Itinerary,
    onDelete: (id: number) => void,
    onToggleComplete: (id: number) => void,
    onToggleLike: (id: number) => void,
}> = ({ itinerary, onDelete, onToggleComplete, onToggleLike }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className={`border rounded-lg overflow-hidden transition-all ${itinerary.isCompleted ? 'bg-green-50 border-green-200 opacity-90' : 'bg-white'}`}>
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                    {itinerary.isCompleted && <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />}
                    <div>
                        <p className="font-bold">{itinerary.title}</p>
                        <p className="text-sm text-gray-500">{itinerary.summary}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onToggleLike(itinerary.id!)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full" title="Like this itinerary">
                        <HeartIcon className={`h-5 w-5 ${itinerary.isLiked ? 'text-red-500 fill-current' : ''}`} />
                    </button>
                    <button onClick={() => onToggleComplete(itinerary.id!)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full" title={itinerary.isCompleted ? 'Mark as Upcoming' : 'Mark as Completed'}>
                        <CheckCircleIcon className={`h-5 w-5 ${itinerary.isCompleted ? 'text-green-600' : ''}`} />
                    </button>
                    <button onClick={() => onDelete(itinerary.id!)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full" title="Delete itinerary"><TrashIcon className="h-5 w-5" /></button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t space-y-4">
                    {itinerary.plan.map(day => (
                        <div key={day.day}>
                            <h4 className="font-semibold text-orange-600">Day {day.day}: {day.title}</h4>
                            <ul className="mt-2 list-disc list-inside space-y-1 pl-2 text-sm text-gray-700">
                                {day.activities.map((act, index) => <li key={index}><strong>{act.time}</strong>: {act.activity}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const ProfilePage: React.FC = () => {
    const { user, updateNotificationPreferences, bookmarks, isPro, openUpgradeModal, removeBookmark, savedItineraries, removeItinerary, toggleItineraryCompleted, toggleItineraryLiked } = useAuth();
    const { posts, setPosts, events, setEvents, products, setProducts, articles } = useContent();
    const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'products' | 'bookmarks' | 'itineraries'>('posts');
    const [itineraryTab, setItineraryTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const myPosts = useMemo(() => posts.filter(post => post.creatorId === user?.id), [posts, user]);
    const myEvents = useMemo(() => events.filter(event => event.creatorId === user?.id), [events, user]);
    const myProducts = useMemo(() => products.filter(product => product.creatorId === user?.id), [products, user]);
    
    const myBookmarks = useMemo(() => {
        return bookmarks.map(bookmark => {
            let item: Post | LocalEvent | Product | Article | undefined;
            if (bookmark.type === 'post') item = posts.find(p => p.id === bookmark.itemId);
            if (bookmark.type === 'event') item = events.find(e => e.id === bookmark.itemId);
            if (bookmark.type === 'product') item = products.find(p => p.id === bookmark.itemId);
            if (bookmark.type === 'article') item = articles.find(a => a.id === bookmark.itemId);
            return { ...bookmark, item };
        }).filter(b => b.item); // Filter out any bookmarks for items that might have been deleted
    }, [bookmarks, posts, events, products, articles]);

    const upcomingItineraries = useMemo(() => savedItineraries.filter(i => !i.isCompleted), [savedItineraries]);
    const completedItineraries = useMemo(() => savedItineraries.filter(i => i.isCompleted), [savedItineraries]);

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
    
    const handleDeleteItinerary = (itineraryId: number) => {
        if (window.confirm('Are you sure you want to delete this itinerary?')) {
            removeItinerary(itineraryId);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <section id="profile" className="py-16 sm:py-24 bg-gray-50">
            {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* User Info Header */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 flex flex-col sm:flex-row items-start gap-6">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-24 w-24 rounded-full border-4 border-orange-200" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircleIcon />
                            </div>
                        )}
                        <div className="flex-grow">
                            <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="mt-2">
                                {isPro ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                        <SparklesIcon /> <span className="ml-1.5">Pro Member</span>
                                    </span>
                                ) : (
                                    <button onClick={openUpgradeModal} className="text-sm font-semibold text-orange-600 hover:text-orange-500">Upgrade to Pro</button>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setIsEditModalOpen(true)} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <PencilIcon className="h-4 w-4" />
                            Edit Profile
                        </button>
                    </div>

                    {/* AI Suggestions Component */}
                    <AISuggestions posts={myPosts} events={myEvents} products={myProducts} bookmarks={myBookmarks} />
                    
                     {/* My Activity Section */}
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">My Activity</h3>
                         {/* Tabs */}
                        <div className="mb-8">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('posts')} className={`${activeTab === 'posts' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Posts</button>
                                    <button onClick={() => setActiveTab('events')} className={`${activeTab === 'events' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Events</button>
                                    <button onClick={() => setActiveTab('products')} className={`${activeTab === 'products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Products</button>
                                    <button onClick={() => setActiveTab('bookmarks')} className={`${activeTab === 'bookmarks' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Bookmarks</button>
                                    <button onClick={() => setActiveTab('itineraries')} className={`${activeTab === 'itineraries' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Itineraries</button>
                                </nav>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            {activeTab === 'posts' && (
                                <div className="space-y-4">
                                    {myPosts.length > 0 ? myPosts.map(post => (
                                        <div key={post.id} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <p className="font-bold">{post.title}</p>
                                                <p className="text-sm text-gray-500">{post.timestamp}</p>
                                            </div>
                                            <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon /></button>
                                        </div>
                                    )) : <p className="text-center text-gray-500">You haven't created any posts yet.</p>}
                                </div>
                            )}
                            {activeTab === 'events' && (
                                <div className="space-y-4">
                                    {myEvents.length > 0 ? myEvents.map(event => (
                                        <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <p className="font-bold">{event.title}</p>
                                                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon /></button>
                                        </div>
                                    )) : <p className="text-center text-gray-500">You haven't created any events yet.</p>}
                                </div>
                            )}
                            {activeTab === 'products' && (
                               <div className="space-y-4">
                                    {myProducts.length > 0 ? myProducts.map(product => (
                                        <div key={product.id} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <p className="font-bold">{product.name}</p>
                                                <p className="text-sm text-gray-500">₹{product.price}</p>
                                            </div>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon /></button>
                                        </div>
                                    )) : <p className="text-center text-gray-500">You haven't listed any products yet.</p>}
                                </div>
                            )}
                            {activeTab === 'bookmarks' && (
                                <div className="space-y-4">
                                    {myBookmarks.length > 0 ? myBookmarks.map(bookmark => (
                                        <div key={`${bookmark.type}-${bookmark.itemId}`} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div className="flex items-center">
                                                <div className="mr-4 text-orange-500">
                                                    {bookmark.type === 'post' && <NewspaperIcon />}
                                                    {bookmark.type === 'event' && <TicketIcon />}
                                                    {bookmark.type === 'product' && <ShoppingCartIcon />}
                                                    {bookmark.type === 'article' && <BookmarkIcon />}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{bookmark.item && ('title' in bookmark.item ? bookmark.item.title : bookmark.item.name)}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{bookmark.type}</p>
                                                </div>
                                            </div>
                                             <button onClick={() => removeBookmark(bookmark)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon /></button>
                                        </div>
                                    )) : <p className="text-center text-gray-500">You haven't bookmarked anything yet.</p>}
                                </div>
                            )}
                            {activeTab === 'itineraries' && (
                                <div>
                                    <div className="flex border-b border-gray-200 mb-4">
                                        <button onClick={() => setItineraryTab('upcoming')} className={`px-4 py-2 text-sm font-medium ${itineraryTab === 'upcoming' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                            Upcoming ({upcomingItineraries.length})
                                        </button>
                                        <button onClick={() => setItineraryTab('completed')} className={`px-4 py-2 text-sm font-medium ${itineraryTab === 'completed' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                            Completed ({completedItineraries.length})
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {itineraryTab === 'upcoming' && (
                                            upcomingItineraries.length > 0 ? upcomingItineraries.map(itinerary => (
                                                <SavedItineraryCard key={itinerary.id} itinerary={itinerary} onDelete={handleDeleteItinerary} onToggleComplete={toggleItineraryCompleted} onToggleLike={toggleItineraryLiked} />
                                            )) : <p className="text-center text-gray-500 py-4">You have no upcoming itineraries planned.</p>
                                        )}
                                        {itineraryTab === 'completed' && (
                                            completedItineraries.length > 0 ? completedItineraries.map(itinerary => (
                                                <SavedItineraryCard key={itinerary.id} itinerary={itinerary} onDelete={handleDeleteItinerary} onToggleComplete={toggleItineraryCompleted} onToggleLike={toggleItineraryLiked} />
                                            )) : <p className="text-center text-gray-500 py-4">You haven't completed any saved trips yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Notification Settings */}
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h3>
                        <div className="space-y-4">
                             <NotificationToggle
                                label="New Community Posts"
                                description="Get notified when a new post is published on the bulletin board."
                                enabled={user.notificationPreferences?.newPosts ?? true}
                                onChange={(enabled) => updateNotificationPreferences({ ...(user.notificationPreferences || { newEvents: true }), newPosts: enabled })}
                            />
                            <NotificationToggle
                                label="New Local Events"
                                description="Receive alerts about new events and workshops in the marketplace."
                                enabled={user.notificationPreferences?.newEvents ?? true}
                                onChange={(enabled) => updateNotificationPreferences({ ...(user.notificationPreferences || { newPosts: true }), newEvents: enabled })}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ProfilePage;