/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { useState } from 'react';
import { generateItinerary } from '../services/geminiService';
import type { Itinerary } from '../types';
import { CalendarIcon, LoadingIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import usePersistentState from '../hooks/usePersistentState';

const ItineraryPlanner: React.FC = () => {
  const { isPro, openUpgradeModal, user } = useAuth();
  const [duration, setDuration] = useState('1 Day');
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState('Mid-range');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [freeGenerationsLeft, setFreeGenerationsLeft] = usePersistentState<number>('itineraryGenerationsCount', 2);
  
  const interestOptions = ['History', 'Food', 'Nature', 'Shopping', 'Spiritual', 'Art & Culture'];

  const handleInterestChange = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPro && freeGenerationsLeft <= 0) {
        openUpgradeModal();
        return;
    }

    if (interests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setItinerary(null);
    try {
      const result = await generateItinerary(duration, interests, budget);
      setItinerary(result);
      if (!isPro) {
          setFreeGenerationsLeft(prev => prev - 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const ItinerarySkeletonLoader: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full mx-auto mb-10"></div>
        <div className="space-y-8">
            <div className="border-l-2 border-gray-200 pl-6">
                <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
                    <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <section id="itinerary-planner" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
            <CalendarIcon />
            <span className="ml-3">Plan Your Perfect Trip</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">Let our AI create a personalized itinerary just for you.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Duration and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">How long is your trip?</label>
                  <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-all">
                    <option>1 Day</option>
                    <option>Weekend (2 Days)</option>
                    <option>3 Days</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">What's your budget?</label>
                  <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-all">
                    <option>Budget-friendly</option>
                    <option>Mid-range</option>
                    <option>Luxury</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Interests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">What are your interests?</label>
                <div className="flex flex-wrap gap-3">
                  {interestOptions.map((interest) => (
                    <button type="button" key={interest} onClick={() => handleInterestChange(interest)} className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all ${interests.includes(interest) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'}`}>
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Submit */}
              <div className="text-center pt-4">
                <button type="submit" disabled={isLoading} className="px-10 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform hover:scale-105 disabled:bg-orange-300 disabled:scale-100 flex items-center justify-center w-full md:w-auto mx-auto">
                  {isLoading ? <><LoadingIcon /> <span className="ml-2">Generating...</span></> : 'Generate Itinerary'}
                </button>
              </div>
               {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
            </form>
            {user && !isPro && (
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">You have <span className="font-bold text-orange-600">{freeGenerationsLeft} free itinerary generation{freeGenerationsLeft !== 1 ? 's' : ''}</span> left. <button onClick={openUpgradeModal} className="font-semibold text-blue-600 hover:underline">Upgrade to Pro</button> for unlimited plans.</p>
                </div>
            )}
          </div>

          {/* Results Section */}
          <div className="mt-8">
            {isLoading && <ItinerarySkeletonLoader />}
            {itinerary && (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">{itinerary.title}</h3>
                <p className="text-center text-gray-600 mb-10">{itinerary.summary}</p>
                <div className="space-y-12">
                  {itinerary.plan.map((day) => (
                    <div key={day.day} className="relative">
                       <div className="absolute top-0 left-4 h-full border-l-2 border-dashed border-orange-300"></div>
                       <div className="pl-12">
                         <div className="flex items-center mb-6">
                            <div className="z-10 bg-orange-500 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-white">
                                {day.day}
                            </div>
                            <h4 className="ml-4 text-xl font-bold text-gray-800">{day.title}</h4>
                        </div>
                        <div className="space-y-6">
                            {day.activities.map((act, index) => (
                                <div key={index} className="bg-gray-50/70 p-5 rounded-lg border border-gray-200 relative ml-4">
                                    <div className="absolute -left-9 top-7 h-px w-5 bg-orange-300"></div>
                                    <p className="font-semibold text-orange-600 mb-1">{act.time}</p>
                                    <h5 className="font-bold text-gray-900">{act.activity}</h5>
                                    <p className="text-gray-600 text-sm mt-1">{act.description}</p>
                                </div>
                            ))}
                        </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryPlanner;