
import React, { useState, useMemo } from 'react';
import type { ServiceListing } from '../types';
import { ServicesIcon, VerifiedIcon } from './icons';

const mockServices: ServiceListing[] = [
  { id: 1, name: 'Gupta Plumbing Services', category: 'Plumbers', description: '24/7 emergency plumbing and fitting services.', phone: '9876543210', rating: 4.8, isVerified: true },
  { id: 2, name: 'Verma Electrical Works', category: 'Electricians', description: 'All types of house wiring and electrical repairs.', phone: '9876543211', rating: 4.9, isVerified: true },
  { id: 3, name: 'Sharma Home Tutors', category: 'Tutors', description: 'Experienced tutors for all subjects, grades 1-12.', phone: '9876543212', rating: 4.7, isVerified: false },
  { id: 4, name: 'City Carpenters', category: 'Carpenters', description: 'Custom furniture and home woodwork repairs.', phone: '9876543213', rating: 4.6, isVerified: true },
  { id: 5, name: 'Gorakhpur AC Repair', category: 'Appliance Repair', description: 'Fast and reliable AC and refrigerator servicing.', phone: '9876543214', rating: 4.8, isVerified: false },
  { id: 6, name: 'Reliable Electricians', category: 'Electricians', description: 'Commercial and residential electrical solutions.', phone: '9876543215', rating: 4.5, isVerified: false },
];

const categories = ['All', 'Plumbers', 'Electricians', 'Tutors', 'Carpenters', 'Appliance Repair'];

const LocalServices: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    return mockServices
      .filter(service => selectedCategory === 'All' || service.category === selectedCategory)
      .filter(service => service.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedCategory, searchTerm]);

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

        <div className="max-w-4xl mx-auto">
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-xl shadow-md mb-8 sticky top-20 z-30 flex flex-col sm:flex-row gap-4 items-center">
             <div className="relative w-full sm:w-1/2">
                <input
                    type="text"
                    placeholder="Search for a service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            <div className="flex-grow overflow-x-auto pb-2">
                <div className="flex space-x-2">
                    {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                        selectedCategory === category
                            ? 'bg-orange-500 text-white'
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
            {filteredServices.map(service => (
              <div key={service.id} className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg flex flex-col">
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-gray-700 font-bold text-sm ml-1">{service.rating}</span>
                   </div>
                   <a href={`tel:${service.phone}`} className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600 transition-colors">
                        Call Now
                    </a>
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && (
                <div className="md:col-span-2 text-center py-10">
                    <p className="text-gray-600">No services found matching your criteria.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalServices;
