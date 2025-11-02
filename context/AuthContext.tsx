/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import type { User, Bookmark, Itinerary } from '../types';
import usePersistentState from '../hooks/usePersistentState';

type AuthModalView = 'login' | 'register';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isPro: boolean;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  upgradeToPro: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (view: AuthModalView) => void;
  closeAuthModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
  updateNotificationPreferences: (prefs: { newPosts: boolean; newEvents: boolean; }) => void;
  updateUserProfile: (updatedData: { name: string; avatarUrl?: string; }) => void;
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookmark: Bookmark) => void;
  isBookmarked: (bookmark: Bookmark) => boolean;
  savedItineraries: Itinerary[];
  saveItinerary: (itinerary: Itinerary) => void;
  removeItinerary: (itineraryId: number) => void;
  isItinerarySaved: (itineraryId: number) => boolean;
  toggleItineraryCompleted: (itineraryId: number) => void;
  toggleItineraryLiked: (itineraryId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = usePersistentState<User | null>('user', null);
  const [bookmarks, setBookmarks] = usePersistentState<Bookmark[]>('bookmarks', []);
  const [savedItineraries, setSavedItineraries] = usePersistentState<Itinerary[]>('savedItineraries', []);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const openAuthModal = (view: AuthModalView) => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };
  
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const switchToLogin = () => setAuthModalView('login');
  const switchToRegister = () => setAuthModalView('register');
  
  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  // Mock login with Google
  const loginWithGoogle = (): Promise<void> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setTimeout(() => {
        const mockUser: User = {
          id: '12345',
          name: 'Jawahar R Mallah',
          email: 'jawahar.mallah@example.com',
          avatarUrl: `https://i.pravatar.cc/150?u=12345`,
          subscriptionTier: 'pro', // This user is a Pro member
          notificationPreferences: {
            newPosts: true,
            newEvents: true,
          }
        };
        setUser(mockUser);
        setIsLoading(false);
        closeAuthModal();
        resolve();
      }, 1000);
    });
  };

  // Mock login with email
  const loginWithEmail = (email: string, pass: string): Promise<void> => {
     return new Promise((resolve, reject) => {
      setIsLoading(true);
      setTimeout(() => {
        if (email === "test@example.com" && pass === "password") {
          const mockUser: User = {
            id: '67890',
            name: 'Priya Sharma',
            email: 'test@example.com',
            subscriptionTier: 'free', // This user is a Free member
            notificationPreferences: {
                newPosts: true,
                newEvents: false,
            }
          };
          setUser(mockUser);
          setIsLoading(false);
          closeAuthModal();
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error("Invalid email or password."));
        }
      }, 1000);
    });
  };
  
  // Mock register with email
  const registerWithEmail = (name: string, email: string, pass: string): Promise<void> => {
     return new Promise((resolve) => {
      setIsLoading(true);
      setTimeout(() => {
        const mockUser: User = {
          id: String(Date.now()),
          name: name,
          email: email,
          subscriptionTier: 'free', // New users start on the free tier
          notificationPreferences: {
            newPosts: true,
            newEvents: true,
          }
        };
        setUser(mockUser);
        setIsLoading(false);
        closeAuthModal();
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateNotificationPreferences = (prefs: { newPosts: boolean; newEvents: boolean; }) => {
    if (user) {
        setUser({ ...user, notificationPreferences: prefs });
    }
  };

  const updateUserProfile = (updatedData: { name: string; avatarUrl?: string; }) => {
    if (user) {
        setUser(currentUser => {
            if (!currentUser) return null;
            return {
                ...currentUser,
                name: updatedData.name,
                // Only update avatar if a new one is provided
                avatarUrl: updatedData.avatarUrl ?? currentUser.avatarUrl,
            };
        });
    }
  };

  const addBookmark = (bookmark: Bookmark) => {
      setBookmarks(prev => [...prev, bookmark]);
  };
  
  const removeBookmark = (bookmark: Bookmark) => {
      setBookmarks(prev => prev.filter(b => !(b.type === bookmark.type && b.itemId === bookmark.itemId)));
  };

  const isBookmarked = (bookmark: Bookmark): boolean => {
      return bookmarks.some(b => b.type === bookmark.type && b.itemId === bookmark.itemId);
  };

  const saveItinerary = (itinerary: Itinerary) => {
    if (!itinerary.id) return;
    const itineraryToSave = { ...itinerary, isCompleted: false, isLiked: false };
    setSavedItineraries(prev => [...prev.filter(i => i.id !== itinerary.id), itineraryToSave]);
  };

  const removeItinerary = (itineraryId: number) => {
      setSavedItineraries(prev => prev.filter(i => i.id !== itineraryId));
  };

  const isItinerarySaved = (itineraryId: number): boolean => {
      return savedItineraries.some(i => i.id === itineraryId);
  };

  const toggleItineraryCompleted = (itineraryId: number) => {
    setSavedItineraries(prev => 
        prev.map(i => 
            i.id === itineraryId ? { ...i, isCompleted: !(i.isCompleted ?? false) } : i
        )
    );
  };

  const toggleItineraryLiked = (itineraryId: number) => {
      setSavedItineraries(prev => 
          prev.map(i => 
              i.id === itineraryId ? { ...i, isLiked: !(i.isLiked ?? false) } : i
          )
      );
  };

  const upgradeToPro = () => {
    if (user) {
        setUser({ ...user, subscriptionTier: 'pro' });
        // In a real app, this would be handled after a successful payment webhook.
        alert('Congratulations! You are now an iLoveGorakhpur Pro member.');
    }
  };
  
  const isPro = useMemo(() => user?.subscriptionTier === 'pro', [user]);

  const value = {
    user,
    isLoading,
    isPro,
    isAuthModalOpen,
    authModalView,
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    upgradeToPro,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    openAuthModal,
    closeAuthModal,
    switchToLogin,
    switchToRegister,
    updateNotificationPreferences,
    updateUserProfile,
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    savedItineraries,
    saveItinerary,
    removeItinerary,
    isItinerarySaved,
    toggleItineraryCompleted,
    toggleItineraryLiked,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};