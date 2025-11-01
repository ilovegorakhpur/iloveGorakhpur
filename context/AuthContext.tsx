import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';

type AuthModalView = 'login' | 'register';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (view: AuthModalView) => void;
  closeAuthModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');

  const openAuthModal = (view: AuthModalView) => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };
  
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const switchToLogin = () => setAuthModalView('login');
  const switchToRegister = () => setAuthModalView('register');
  
  // Mock login with Google
  const loginWithGoogle = (): Promise<void> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setTimeout(() => {
        const mockUser: User = {
          id: '12345',
          name: 'Chandra Prakash',
          email: 'chandra.prakash@example.com',
          avatarUrl: `https://i.pravatar.cc/150?u=12345`
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

  const value = {
    user,
    isLoading,
    isAuthModalOpen,
    authModalView,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    openAuthModal,
    closeAuthModal,
    switchToLogin,
    switchToRegister,
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
