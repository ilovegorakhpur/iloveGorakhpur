
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
}

export interface Post {
  id: number;
  author: string; // Keep it simple as string, from User.name
  timestamp: string;
  title: string;
  content: string;
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
  date: string;
  location: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface Product {
  id: number;
  name: string;
  seller: string;
  price: number;
  imageUrl: string;
  category: string;
}