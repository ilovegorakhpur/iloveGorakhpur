
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon, LogoutIcon } from './icons';

const Header: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-orange-600">
            i<span className="text-pink-500">Love</span>Gorakhpur
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">Features</a>
            <a href="#marketplace" className="text-gray-600 hover:text-orange-600 transition-colors">Marketplace</a>
            <a href="#itinerary-planner" className="text-gray-600 hover:text-orange-600 transition-colors">Itinerary Planner</a>
            <a href="#services" className="text-gray-600 hover:text-orange-600 transition-colors">Services</a>
            <a href="#community" className="text-gray-600 hover:text-orange-600 transition-colors">Community</a>
            <a href="#ai-assistant" className="text-gray-600 hover:text-orange-600 transition-colors">AI Assistant</a>
            <div className="border-l border-gray-200 h-5"></div>
            <a href="#" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">Privacy Policy</a>
          </nav>
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full border-2 border-orange-500" />
                  ) : (
                    <UserCircleIcon />
                  )}
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogoutIcon />
                      <span className="ml-2">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md shadow-sm text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;