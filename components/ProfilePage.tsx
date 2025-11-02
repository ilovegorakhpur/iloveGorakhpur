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
import { TrashIcon, UserCircleIcon, TicketIcon, ShoppingCartIcon, NewspaperIcon, BookmarkIcon, SparklesIcon } from './icons';
import type { Post, LocalEvent, Product, Article } from '../types';

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
    const { user, updateNotificationPreferences, bookmarks, isPro, openUpgradeModal, removeBookmark } = useAuth();
    const { posts, setPosts, events, setEvents, products, setProducts, articles } = useContent();
    const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'products' | 'bookmarks'>('posts');

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

    if (!user) {
        return null;
    }

    return (
        <section id="profile" className="py-16 sm:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* User Info Header */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 flex flex-col sm:flex-row items-center gap-6">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-24 w-24 rounded-full border-4 border-orange-200" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircleIcon />
                            </div>
                        )}
                        <div>
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
                    </div>
                    
                    {/* Tabs */}
                    <div className="mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('posts')} className={`${activeTab === 'posts' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Posts</button>
                                <button onClick={() => setActiveTab('events')} className={`${activeTab === 'events' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Events</button>
                                <button onClick={() => setActiveTab('products')} className={`${activeTab === 'products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Products</button>
                                <button onClick={() => setActiveTab('bookmarks')} className={`${activeTab === 'bookmarks' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Bookmarks</button>
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

// Fix: Added the missing default export for the ProfilePage component.
export default ProfilePage;
