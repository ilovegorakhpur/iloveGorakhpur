import React, { createContext, useContext, ReactNode } from 'react';
import type { LocalEvent, Product, Post, ServiceListing } from '../types';
import usePersistentState from '../hooks/usePersistentState';

// --- Initial Mock Data (used only if localStorage is empty) ---

const initialMockEvents: LocalEvent[] = [
  { id: 1, title: 'Live Music Night at The Brew House', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'The Brew House, Golghar', price: 499, imageUrl: 'https://picsum.photos/400/250?random=10', category: 'Music', duration: '3 hours', creatorId: '99999' },
  { id: 2, title: 'Gorakhpur Terracotta Workshop', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), location: 'Craft Village, Taramandal', price: 250, imageUrl: 'https://picsum.photos/400/250?random=11', category: 'Workshop', duration: '4 hours', recurring: 'Weekly', creatorId: '67890' },
  { id: 3, title: 'Sunday Stand-up Comedy', date: new Date().toISOString(), location: 'Central Perk Cafe', price: 300, imageUrl: 'https://picsum.photos/400/250?random=12', category: 'Comedy', duration: '2 hours', creatorId: '99999' },
  { id: 4, title: 'Monthly Tech Meetup', date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), location: 'IIT Gorakhpur', price: 0, imageUrl: 'https://picsum.photos/400/250?random=13', category: 'Workshop', duration: 'Full Day', creatorId: '67890' },
];

const initialMockProducts: Product[] = [
    { id: 1, name: 'Handmade Terracotta Horse', seller: 'Shilpi Crafts', price: 1200, imageUrl: 'https://picsum.photos/400/400?random=20', category: 'Handicrafts', creatorId: '67890', description: 'A beautiful, handcrafted terracotta horse, a symbol of Gorakhpur\'s rich artistic heritage. Perfect for home decor or as a unique gift.', reviews: [] },
    { id: 2, name: 'Gorakhpuri Spices Combo', seller: 'Masala Junction', price: 450, imageUrl: 'https://picsum.photos/400/400?random=21', category: 'Food', creatorId: '99999', description: 'An authentic blend of local spices to bring the taste of Gorakhpur to your kitchen.', reviews: [] },
    { id: 3, name: 'Pure Local Honey (500g)', seller: 'Purvanchal Farms', price: 350, imageUrl: 'https://picsum.photos/400/400?random=22', category: 'Food', creatorId: '99999', description: '100% pure and natural honey sourced from local farms in the Purvanchal region.', reviews: [] },
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
  { id: 1, name: 'Gupta Plumbing Services', category: 'Plumbers', description: '24/7 emergency plumbing and fitting services.', phone: '9876543210', rating: 4.8, isVerified: true },
  { id: 2, name: 'Verma Electrical Works', category: 'Electricians', description: 'All types of house wiring and electrical repairs.', phone: '9876543211', rating: 4.9, isVerified: true },
  { id: 3, name: 'Sharma Home Tutors', category: 'Tutors', description: 'Experienced tutors for all subjects, grades 1-12.', phone: '9876543212', rating: 4.7, isVerified: false },
  { id: 4, name: 'City Carpenters', category: 'Carpenters', description: 'Custom furniture and home woodwork repairs.', phone: '9876543213', rating: 4.6, isVerified: true },
  { id: 5, name: 'Gorakhpur AC Repair', category: 'Appliance Repair', description: 'Fast and reliable AC and refrigerator servicing.', phone: '9876543214', rating: 4.8, isVerified: false },
  { id: 6, name: 'Reliable Electricians', category: 'Electricians', description: 'Commercial and residential electrical solutions.', phone: '9876543215', rating: 4.5, isVerified: false },
];


// --- Context Definition ---

interface ContentContextType {
  events: LocalEvent[];
  setEvents: React.Dispatch<React.SetStateAction<LocalEvent[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  services: ServiceListing[];
  setServices: React.Dispatch<React.SetStateAction<ServiceListing[]>>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = usePersistentState<LocalEvent[]>('events', initialMockEvents);
  const [products, setProducts] = usePersistentState<Product[]>('products', initialMockProducts);
  const [posts, setPosts] = usePersistentState<Post[]>('posts', initialPosts);
  const [services, setServices] = usePersistentState<ServiceListing[]>('services', initialMockServices);

  const value = {
    events,
    setEvents,
    products,
    setProducts,
    posts,
    setPosts,
    services,
    setServices,
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