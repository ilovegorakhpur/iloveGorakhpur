import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { UserCircleIcon, LogoutIcon, MenuIcon, XIcon, ShoppingCartIcon } from './icons';

const Header: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
  const { cartItemCount, openCart } = useCart();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#marketplace', label: 'Marketplace' },
    { href: '#news', label: 'News'},
    { href: '#itinerary-planner', label: 'Itinerary Planner' },
    { href: '#services', label: 'Services' },
    { href: '#community', label: 'Community' },
    { href: '#ai-assistant', label: 'AI Assistant' },
  ];

  // Effect to close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80; // Approximate height of the sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleMobileMenuAction = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    handleScroll(e, href);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-orange-600">
            i<span className="text-pink-500">Love</span>Gorakhpur
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={(e) => handleScroll(e, link.href)}
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-l border-gray-200 h-5"></div>
            <a href="#" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">Privacy Policy</a>
          </nav>
          
          <div className="flex items-center space-x-2">
            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="focus:outline-none">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full border-2 border-orange-500" />
                    ) : (
                      <UserCircleIcon />
                    )}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
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
               <button onClick={openCart} className="relative p-2 text-gray-600 hover:text-orange-600 focus:outline-none" aria-label={`View cart with ${cartItemCount} items`}>
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

             {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleMobileMenuAction(e, link.href)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                  >
                    {link.label}
                  </a>
                ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="px-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                       {user.avatarUrl ? (
                        <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <UserCircleIcon />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                      >
                        <LogoutIcon />
                        <span className="ml-2">Logout</span>
                      </button>
                  </div>
                </div>
              ) : (
                <div className="px-2 space-y-2">
                  <button
                    onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                    className="w-full text-center block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { openAuthModal('register'); setIsMobileMenuOpen(false); }}
                    className="w-full text-center block px-3 py-2 rounded-md text-base font-medium text-white bg-orange-500 hover:bg-orange-600"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
            <div className="py-3 border-t border-gray-200">
                <div className="px-5">
                    <button 
                        onClick={() => { openCart(); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 p-2"
                    >
                        <span className="flex items-center">
                            <ShoppingCartIcon className="h-6 w-6 mr-2" />
                            <span>My Cart</span>
                        </span>
                        {cartItemCount > 0 && (
                             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            <div className="py-3 border-t border-gray-200">
                <div className="px-2 space-y-1">
                    <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-gray-500 hover:text-orange-600 hover:bg-gray-50">Terms of Service</a>
                    <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-gray-500 hover:text-orange-600 hover:bg-gray-50">Privacy Policy</a>
                </div>
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;
