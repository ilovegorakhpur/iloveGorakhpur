/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import type { LocalEvent, Product, Post, ServiceListing, Article } from '../types';
import usePersistentState from '../hooks/usePersistentState';

// --- Initial Mock Data (used only if localStorage is empty) ---

const initialMockEvents: LocalEvent[] = [
  { id: 1, title: 'Live Music Night at The Brew House', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'The Brew House, Golghar', price: 499, imageUrl: 'https://picsum.photos/400/250?random=10', category: 'Music', duration: '3 hours', creatorId: '99999', coordinates: { lat: 25, lng: 30 } },
  { id: 2, title: 'Gorakhpur Terracotta Workshop', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), location: 'Craft Village, Taramandal', price: 250, imageUrl: 'https://picsum.photos/400/250?random=11', category: 'Workshop', duration: '4 hours', recurring: 'Weekly', creatorId: '67890', coordinates: { lat: 70, lng: 75 } },
  { id: 3, title: 'Sunday Stand-up Comedy', date: new Date().toISOString(), location: 'Central Perk Cafe', price: 300, imageUrl: 'https://picsum.photos/400/250?random=12', category: 'Comedy', duration: '2 hours', creatorId: '99999', coordinates: { lat: 50, lng: 50 } },
  { id: 4, title: 'Monthly Tech Meetup', date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), location: 'IIT Gorakhpur', price: 0, imageUrl: 'https://picsum.photos/400/250?random=13', category: 'Workshop', duration: 'Full Day', creatorId: '67890', coordinates: { lat: 80, lng: 20 } },
];

const initialMockProducts: Product[] = [
    { id: 1, name: 'Handmade Terracotta Horse', seller: 'Shilpi Crafts', price: 1200, imageUrl: 'https://picsum.photos/400/400?random=20', category: 'Handicrafts', creatorId: '67890', description: 'A beautiful, handcrafted terracotta horse, a symbol of Gorakhpur\'s rich artistic heritage. Perfect for home decor or as a unique gift.', reviews: [], coordinates: { lat: 72, lng: 78 } },
    { id: 2, name: 'Gorakhpuri Spices Combo', seller: 'Masala Junction', price: 450, imageUrl: 'https://picsum.photos/400/400?random=21', category: 'Food', creatorId: '99999', description: 'An authentic blend of local spices to bring the taste of Gorakhpur to your kitchen.', reviews: [], coordinates: { lat: 45, lng: 55 } },
    { id: 3, name: 'Pure Local Honey (500g)', seller: 'Purvanchal Farms', price: 350, imageUrl: 'https://picsum.photos/400/400?random=22', category: 'Food', creatorId: '99999', description: '100% pure and natural honey sourced from local farms in the Purvanchal region.', reviews: [], coordinates: { lat: 85, lng: 60 } },
];

const initialPosts: Post[] = [
  {
    id: 1,
    author: 'Rohan Gupta',
    creatorId: '99999',
    timestamp: '2 hours ago',
    title: 'Looking for a reliable plumber in Golghar area',
    content: 'Hi everyone, my kitchen sink is leaking and I need a good plumber urgently. Any recommendations in the Golghar area would be a great help. Thanks!',
    category: 'Help Needed',
    likes: [],
    comments: [],
  },
  {
    id: 2,
    author: 'Priya Sharma',
    creatorId: '67890',
    timestamp: '1 day ago',
    title: 'Weekend Farmer\'s Market at City Mall',
    content: 'Just a reminder that the weekly farmer\'s market is happening this Saturday from 9 AM to 1 PM in the City Mall parking lot. Come get some fresh, local produce!',
    category: 'Announcements',
    likes: [],
    comments: [],
  },
];

const initialMockServices: ServiceListing[] = [
  { id: 1, name: 'Gupta Plumbing Services', category: 'Plumbers', description: '24/7 emergency plumbing and fitting services.', phone: '9876543210', rating: 4.8, isVerified: true, coordinates: { lat: 28, lng: 33 } },
  { id: 2, name: 'Verma Electrical Works', category: 'Electricians', description: 'All types of house wiring and electrical repairs.', phone: '9876543211', rating: 4.9, isVerified: true, coordinates: { lat: 55, lng: 48 } },
  { id: 3, name: 'Sharma Home Tutors', category: 'Tutors', description: 'Experienced tutors for all subjects, grades 1-12.', phone: '9876543212', rating: 4.7, isVerified: false, coordinates: { lat: 60, lng: 15 } },
  { id: 4, name: 'City Carpenters', category: 'Carpenters', description: 'Custom furniture and home woodwork repairs.', phone: '9876543213', rating: 4.6, isVerified: true, coordinates: { lat: 15, lng: 80 } },
  { id: 5, name: 'Gorakhpur AC Repair', category: 'Appliance Repair', description: 'Fast and reliable AC and refrigerator servicing.', phone: '9876543214', rating: 4.8, isVerified: false, coordinates: { lat: 78, lng: 40 } },
  { id: 6, name: 'Reliable Electricians', category: 'Electricians', description: 'Commercial and residential electrical solutions.', phone: '9876543215', rating: 4.5, isVerified: false, coordinates: { lat: 35, lng: 65 } },
];

const initialMockArticles: Article[] = [
  {
    id: 1,
    title: 'Gorakhpur Zoo Welcomes Two Bengal Tiger Cubs',
    snippet: 'The Shaheed Ashfaq Ullah Khan Prani Udyan has announced the birth of two healthy Bengal tiger cubs, a significant event for the city\'s conservation efforts...',
    imageUrl: 'https://picsum.photos/400/250?random=1',
    content: `The Shaheed Ashfaq Ullah Khan Prani Udyan in Gorakhpur is celebrating a joyous occasion with the arrival of two Bengal tiger cubs. The cubs, one male and one female, were born to the zoo's resident tigress, 'Meera', and are reported to be in excellent health. Zoo officials have stated that this is a major milestone for their captive breeding program and a testament to the high standard of care provided at the facility. The cubs will be kept under close observation for the next few months and will not be available for public viewing immediately to ensure their well-being. This event is expected to significantly boost visitor interest and further establish the Gorakhpur Zoo as a key center for wildlife conservation in the region.`
  },
  {
    id: 2,
    title: 'New Flyover at Paidleganj to Ease Traffic Congestion',
    snippet: 'Construction is set to begin on a new multi-lane flyover at the busy Paidleganj intersection, promising to alleviate long-standing traffic issues...',
    imageUrl: 'https://picsum.photos/400/250?random=2',
    content: `In a major infrastructural development for Gorakhpur, the government has approved the construction of a new six-lane flyover at the Paidleganj crossing. This intersection is one of the city's most notorious traffic bottlenecks, especially during peak hours. The project aims to provide a seamless flow of traffic for vehicles heading towards Deoria and Kushinagar from the city center. Officials from the Public Works Department have outlined a 24-month timeline for the project's completion. While some temporary disruptions are expected during the construction phase, the long-term benefits of reduced travel time and lower pollution levels are being hailed as a significant step forward for the city's urban planning.`
  },
   {
    id: 3,
    title: 'Annual Gorakhpur Mahotsav to Feature Local Artisans',
    // Fix: Completed the missing properties for this Article object.
    snippet: 'This year\'s Gorakhpur Mahotsav will place a special emphasis on promoting local arts and crafts, with dedicated pavilions for terracotta and textile artists.',
    imageUrl: 'https://picsum.photos/400/250?random=3',
    content: `The upcoming annual Gorakhpur Mahotsav is set to be a grand celebration of local culture, with a particular focus on the region's talented artisans. Organizers have announced that dedicated pavilions will be set up to showcase the world-renowned terracotta crafts and the intricate handloom textiles of Gorakhpur. The move aims to provide a larger platform for local artists to connect with a wider audience and boost the local economy. In addition to the artisan showcases, the festival will feature a lineup of cultural performances, food stalls offering regional delicacies, and various competitions. The event is scheduled to take place in the second week of January and is expected to attract a large number of tourists.`
  },
];

// --- Define the context type ---
interface ContentContextType {
  events: LocalEvent[];
  setEvents: Dispatch<SetStateAction<LocalEvent[]>>;
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  services: ServiceListing[];
  setServices: Dispatch<SetStateAction<ServiceListing[]>>;
  articles: Article[];
  setArticles: Dispatch<SetStateAction<Article[]>>;
}

// --- Create and export the context and provider ---
// Fix: Implemented a proper Context Provider and a custom hook to manage and distribute content data.
const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = usePersistentState<LocalEvent[]>('events', initialMockEvents);
  const [products, setProducts] = usePersistentState<Product[]>('products', initialMockProducts);
  const [posts, setPosts] = usePersistentState<Post[]>('posts', initialPosts);
  const [services, setServices] = usePersistentState<ServiceListing[]>('services', initialMockServices);
  const [articles, setArticles] = usePersistentState<Article[]>('articles', initialMockArticles);

  const value = {
    events,
    setEvents,
    products,
    setProducts,
    posts,
    setPosts,
    services,
    setServices,
    articles,
    setArticles,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
