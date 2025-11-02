/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { useState, useMemo } from 'react';
import type { ServiceListing } from '../types';
import { ServicesIcon, VerifiedIcon, StarIcon } from './icons';
import { useContent } from '../context/ContentContext';

const ServiceCard: React.FC<{ service: ServiceListing }> = ({ service }) => (
    <div className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg flex flex-col">
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 pr-2">{service.name}</h3>
          {service.isVerified && (
            <div className="flex-shrink-0 flex items-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              <VerifiedIcon />
              <span className="ml-1">Verified</span>
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-orange-600 mb-3">{service.category}</p>
        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
         <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-700 font-bold text-sm ml-1">{service.rating}</span>
         </div>
         <a href={`tel:${service.phone}`} className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600 transition-colors">
              Call Now
          </a>
      </div>
    </div>
);
const MemoizedServiceCard = React.memo(ServiceCard);

const LocalServices: React.FC = () => {
  const { services: mockServices } = useContent();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'name'

  const categories = useMemo(() => {
    const allCategories = mockServices.map(s => s.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [mockServices]);

  const processedServices = useMemo(() => {
    let services = [...mockServices];

    // Filter by Verified
    if (showVerifiedOnly) {
      services = services.filter(service => service.isVerified);
    }
    
    // Filter by Category
    if (selectedCategory !== 'All') {
      services = services.filter(service => service.category === selectedCategory);
    }

    // Filter by Search Term (in name and description)
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      services = services.filter(service => 
        service.name.toLowerCase().includes(lowercasedTerm) ||
        service.description.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Sort
    if (sortBy === 'rating') {
      services.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      services.sort((a, b) => a.name.localeCompare(b.name));
    }

    return services;
  }, [selectedCategory, searchTerm, showVerifiedOnly, sortBy, mockServices]);

  return (
    <section id="services" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
            <ServicesIcon />
            <span className="ml-3">Verified Local Services</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">Find trusted professionals for your everyday needs.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-xl shadow-md mb-8 sticky top-20 z-30">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="relative lg:col-span-1">
                    <input
                        type="text"
                        placeholder="Search services or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-gray-700 bg-gray-100 rounded-lg border-2 border-transparent focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center bg-gray-100 p-2 rounded-lg">
                        <label htmlFor="sort-by" className="text-sm font-medium text-gray-600 mr-2 whitespace-nowrap">Sort by:</label>
                        <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-white px-3 py-2 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none">
                            <option value="rating">Highest Rating</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                    <label htmlFor="verified-toggle" className="flex items-center justify-center cursor-pointer select-none bg-gray-100 p-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-600 mr-3">Verified Only</span>
                        <div className="relative">
                        <input type="checkbox" id="verified-toggle" className="sr-only" checked={showVerifiedOnly} onChange={e => setShowVerifiedOnly(e.target.checked)} />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${showVerifiedOnly ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${showVerifiedOnly ? 'translate-x-full' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
            <div className="mt-4 flex-grow overflow-x-auto pb-2">
                <div className="flex space-x-2">
                    {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                        selectedCategory === category
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {category}
                    </button>
                    ))}
                </div>
            </div>
          </div>

          {/* Service Listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedServices.map(service => (
              <MemoizedServiceCard key={service.id} service={service} />
            ))}
            {processedServices.length === 0 && (
                <div className="md:col-span-2 text-center py-10 bg-white rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">No Services Found</h3>
                    <p className="text-gray-600 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalServices;