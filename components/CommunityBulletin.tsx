
import React, { useState, useEffect, useMemo } from 'react';
import type { Post, Comment } from '../types';
import { CommunityIcon, ShareIcon, HeartIcon, ChatBubbleIcon, SendIcon, BookmarkIcon, LoadingIcon, ExclamationCircleIcon, PlusIcon, XIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { shareContent } from '../utils/share';
import { moderateContent } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';


const CommunityBulletin: React.FC = () => {
  const { user, openAuthModal, addBookmark, removeBookmark, isBookmarked } = useAuth();
  const { posts, setPosts } = useContent();
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [shareStatus, setShareStatus] = useState('');
  const [visibleComments, setVisibleComments] = useState<Record<number, boolean>>({});
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  
  const postCategories = ['Help Needed', 'Announcements', 'For Sale', 'Events', 'General'];

  useEffect(() => {
    if (shareStatus) {
        const timer = setTimeout(() => setShareStatus(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [shareStatus]);

  const handleShare = async (post: Post) => {
    const status = await shareContent({
      title: post.title,
      text: post.content,
      url: window.location.href + '#community',
    });
    setShareStatus(status);
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setPostImageFile(file);
        const base64 = await fileToBase64(file);
        setPostImagePreview(base64);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !user || !newPostCategory) return;
    
    setIsModerating(true);
    setModerationError(null);
    
    try {
        const fullPostText = `${newPostTitle}\n${newPostContent}`;
        const moderationResult = await moderateContent(fullPostText);
        
        if (moderationResult.decision === 'UNSAFE') {
            setModerationError("This post appears to violate our community guidelines and cannot be published. Please revise your content.");
            setIsModerating(false);
            return;
        }

        const newPost: Post = {
          id: Date.now(),
          author: user.name,
          creatorId: user.id,
          timestamp: 'Just now',
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
          imageUrl: postImagePreview || undefined,
          likes: [],
          comments: [],
        };

        setPosts(prevPosts => [newPost, ...prevPosts]);
        
        console.log('// SIMULATING PUSH NOTIFICATION: A new post was created. A notification would be sent to subscribed users.');
        
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('');
        setPostImageFile(null);
        setPostImagePreview(null);
    } catch (error) {
        console.error(error);
        setModerationError("An error occurred while checking your post. Please try again.");
    } finally {
        setIsModerating(false);
    }
  };

  const handleLike = (postId: number) => {
    if (!user) {
        openAuthModal('login');
        return;
    }
    setPosts(prevPosts =>
        prevPosts.map(post => {
            if (post.id === postId) {
                const currentLikes = post.likes || [];
                const userHasLiked = currentLikes.includes(user.id as string);
                const newLikes = userHasLiked
                    ? currentLikes.filter(id => id !== user.id)
                    : [...currentLikes, user.id as string];
                return { ...post, likes: newLikes };
            }
            return post;
        })
    );
  };

  const handleBookmarkToggle = (post: Post) => {
      if (!user) {
          openAuthModal('login');
          return;
      }
      const bookmark = { type: 'post' as const, itemId: post.id };
      if (isBookmarked(bookmark)) {
          removeBookmark(bookmark);
      } else {
          addBookmark(bookmark);
      }
  };


  const handleCommentSubmit = (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    if (!user || !newComments[postId]?.trim()) return;

    const newComment: Comment = {
        id: Date.now(),
        author: user.name,
        creatorId: user.id,
        timestamp: 'Just now',
        content: newComments[postId],
    };

    setPosts(prevPosts =>
        prevPosts.map(post => {
            if (post.id === postId) {
                const updatedComments = [...(post.comments || []), newComment];
                return { ...post, comments: updatedComments };
            }
            return post;
        })
    );
    
    setNewComments(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: number) => {
    setVisibleComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };
  
  const displayCategories = useMemo(() => {
      const allCategories = new Set(posts.map(p => p.category));
      return ['All', ...Array.from(allCategories)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return posts;
    return posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Post Title"
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                    required
                  />
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {postCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
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
                <div>
                    <label htmlFor="post-image-upload" className="block text-sm font-medium text-gray-700 mb-2">Attach an image (optional)</label>
                    <div className="mt-1 flex items-center space-x-4 p-3 border-2 border-dashed border-gray-300 rounded-lg">
                        {postImagePreview && (
                            <div className="relative">
                                <img src={postImagePreview} alt="Post preview" className="h-20 w-20 object-cover rounded-md"/>
                                <button type="button" onClick={() => setPostImagePreview(null)} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md"><XIcon/></button>
                            </div>
                        )}
                        <input type="file" id="post-image-upload" className="hidden" onChange={handleImageChange} accept="image/*" />
                        <label htmlFor="post-image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                            <PlusIcon />
                            <span className="ml-2">Upload Image</span>
                        </label>
                    </div>
                </div>
                {moderationError && (
                    <div className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-3 flex items-start">
                        <ExclamationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
                        <p>{moderationError}</p>
                    </div>
                )}
                <div className="text-right">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 disabled:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center min-w-[100px] float-right"
                    disabled={!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory || isModerating}
                  >
                    {isModerating ? <LoadingIcon /> : 'Post'}
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

          {/* Category Filters */}
           <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                  {displayCategories.map(category => (
                      <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === category ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                      >
                          {category}
                      </button>
                  ))}
              </div>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {filteredPosts.length > 0 ? filteredPosts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-orange-600">{post.author}</p>
                   <span className="text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">{post.category}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h4>
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="rounded-lg mb-4 max-h-80 w-full object-cover"/>}
                <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-500 font-medium transition-colors">
                           <HeartIcon className={`h-5 w-5 ${post.likes?.includes(user?.id as string) ? 'text-red-500 fill-current' : ''}`} />
                           <span>{post.likes?.length || 0}</span>
                        </button>
                        <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-500 font-medium transition-colors">
                           <ChatBubbleIcon />
                           <span>{post.comments?.length || 0}</span>
                        </button>
                         <button onClick={() => handleShare(post)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 font-medium transition-colors" aria-label="Share post">
                            <ShareIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleBookmarkToggle(post)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors" aria-label="Bookmark post">
                            <BookmarkIcon className={`h-5 w-5 ${isBookmarked({ type: 'post', itemId: post.id }) ? 'text-orange-500 fill-current' : ''}`} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                </div>
                {visibleComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Comments List */}
                        <div className="space-y-3 mb-4">
                            {(post.comments || []).map(comment => (
                                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm text-gray-800">{comment.author}</p>
                                        <p className="text-xs text-gray-500">{comment.timestamp}</p>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                </div>
                            ))}
                             {(post.comments?.length || 0) === 0 && (
                                <p className="text-sm text-center text-gray-500 py-2">No comments yet. Be the first to reply!</p>
                             )}
                        </div>
                        {/* New Comment Form */}
                        {user ? (
                            <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newComments[post.id] || ''}
                                    onChange={(e) => setNewComments(prev => ({...prev, [post.id]: e.target.value}))}
                                    placeholder="Write a comment..."
                                    className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                                    required
                                />
                                <button type="submit" className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300" disabled={!newComments[post.id]?.trim()}>
                                    <SendIcon />
                                </button>
                            </form>
                        ) : (
                            <p className="text-sm text-center text-gray-600">Please <button onClick={() => openAuthModal('login')} className="font-semibold text-orange-600 hover:underline">log in</button> to comment.</p>
                        )}
                    </div>
                )}
              </div>
            )) : (
              <div className="text-center py-10 bg-white rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">No Posts Found</h3>
                    <p className="text-gray-600 mt-2">There are no posts in this category yet. Be the first!</p>
                </div>
            )}
          </div>
        </div>
        {shareStatus && <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{shareStatus}</div>}
      </div>
    </section>
  );
};

export default CommunityBulletin;