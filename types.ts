/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React from 'react';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  groundingChunks?: any[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    subscriptionTier?: 'free' | 'pro';
    notificationPreferences?: {
        newPosts: boolean;
        newEvents: boolean;
    };
}

export interface Bookmark {
  type: 'post' | 'event' | 'product' | 'article';
  itemId: number;
}


export interface Comment {
  id: number;
  author: string;
  creatorId: string;
  timestamp: string;
  content: string;
}

export interface Post {
  id: number;
  author: string; // Keep it simple as string, from User.name
  timestamp: string;
  content: string;
  title: string;
  creatorId?: string;
  category: string;
  likes?: string[];
  comments?: Comment[];
  imageUrl?: string;
}

// New types for Itinerary Planner
export interface Activity {
  time: string;
  activity: string;
  description: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Itinerary {
  title: string;
  summary: string;
  plan: DayPlan[];
}

// New type for Local Services Directory
export interface ServiceListing {
  id: number;
  name: string;
  category: string;
  description: string;
  phone: string;
  rating: number;
  isVerified: boolean;
  coordinates: Coordinates;
}

// New type for Local News
export interface Article {
  id: number;
  title: string;
  snippet: string;
  imageUrl: string;
  content: string; // The full content of the article to be summarized
  summary?: string; // To store the generated summary
}

// New types for Marketplace
export interface LocalEvent {
  id: number;
  title: string;
  date: string; // Standardized to ISO string for filtering
  location: string;
  price: number;
  imageUrl: string;
  category: string;
  duration?: string;
  recurring?: string;
  creatorId?: string;
  coordinates: Coordinates;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Product {
  id: number;
  name: string;
  seller: string;
  price: number;
  imageUrl: string;
  category: string;
  creatorId?: string;
  description?: string;
  reviews?: Review[];
  coordinates: Coordinates;
}

export interface CartItem extends Product {
  quantity: number;
}