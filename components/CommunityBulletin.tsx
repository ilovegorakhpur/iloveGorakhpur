import React, { useState } from 'react';
import type { Post } from '../types';
import { CommunityIcon } from './icons';
import { useAuth } from '../context/AuthContext';

const initialPosts: Post[] = [
  {
    id: 1,
    author: 'Rohan Gupta',
    timestamp: '2 hours ago',
    title: 'Looking for a reliable plumber in Golghar area',
    content: 'Hi everyone, my kitchen sink is leaking and I need a good plumber urgently. Any recommendations in the Golghar area would be a great help. Thanks!',
  },
  {
    id: 2,
    author: 'Priya Sharma',
    timestamp: '1 day ago',
    title: 'Weekend Farmer\'s Market at City Mall',
    content: 'Just a reminder that the weekly farmer\'s market is happening this Saturday from 9 AM to 1 PM in the City Mall parking lot. Come get some fresh, local produce!',
  },
];

const CommunityBulletin: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !user) return;

    const newPost: Post = {
      id: Date.now(),
      author: user.name,
      timestamp: 'Just now',
      title: newPostTitle,
      content: newPostContent,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
  };

  return (
    <section id="community" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
            <CommunityIcon />
            <span className="ml-3">Community Bulletin Board</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">Connect with your neighbors. Ask questions, share news, and stay informed.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* New Post Form or Login Prompt */}
          {user ? (
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create a New Post</h3>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Post Title"
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`What's on your mind, ${user.name}?`}
                    rows={4}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                    required
                  ></textarea>
                </div>
                <div className="text-right">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 disabled:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-xl shadow-md mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Join the conversation!</h3>
                <p className="text-gray-600 mb-4">Sign in to create your own posts and connect with the community.</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => openAuthModal('login')}
                        className="px-6 py-2 bg-white border border-orange-500 text-orange-500 font-semibold rounded-md hover:bg-orange-50 transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => openAuthModal('register')}
                        className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
          )}


          {/* Posts List */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-orange-600">{post.author}</p>
                  <p className="text-xs text-gray-500">{post.timestamp}</p>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityBulletin;
