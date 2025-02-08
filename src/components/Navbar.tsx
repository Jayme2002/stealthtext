import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              <span className="font-semibold text-xl">StealthWriter</span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-900">
                Home
              </Link>
              <Link to="/humanizer" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                Humanizer
              </Link>
              <Link to="/ai-detector" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                AI Detector
              </Link>
              <Link to="/pricing" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                Pricing
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                {subscription?.plan === 'free' && (
                  <Link
                    to="/pricing"
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                  >
                    Upgrade
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                >
                  Try For Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};