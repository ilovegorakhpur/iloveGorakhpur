
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon, XIcon, EyeIcon, EyeOffIcon, LoadingIcon } from './icons';

const AuthModal: React.FC = () => {
  const {
    authModalView,
    closeAuthModal,
    switchToLogin,
    switchToRegister,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    isLoading,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoginView = authModalView === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLoginView) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(name, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={closeAuthModal}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <XIcon />
        </button>

        <div className="p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            {isLoginView ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {isLoginView
              ? 'Sign in to continue to iLoveGorakhpur.'
              : 'Join our community to post and connect.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-gray-800 bg-gray-50 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-all"
                  placeholder="Full Name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-gray-800 bg-gray-50 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-all"
                placeholder="Email Address"
              />
            </div>
            <div>
              <label htmlFor="password"  className="sr-only">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLoginView ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 text-gray-800 bg-gray-50 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 transition-all"
            >
              {isLoading ? <LoadingIcon /> : (isLoginView ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-all"
              >
                <GoogleIcon />
                <span className="ml-3">Sign in with Google</span>
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm">
            <p className="text-gray-600">
              {isLoginView ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={isLoginView ? switchToRegister : switchToLogin}
                className="font-medium text-orange-600 hover:text-orange-500 ml-1"
              >
                {isLoginView ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;