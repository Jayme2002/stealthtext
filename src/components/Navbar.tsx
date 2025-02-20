import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getPlanName } from '../utils/subscriptionPlanMapping';

export const Navbar: React.FC<{ pageTitle?: string }> = ({ pageTitle }) => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFreePlan = !subscription || subscription.plan === 'free';

  const navControls = !user ? (
    <div className="flex items-center gap-3">
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
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
        isFreePlan ? 'bg-gray-100 text-gray-700' : 'bg-black text-white'
      }`}>
        {subscription ? getPlanName(subscription.plan) : 'Free Plan'}
        <span className="ml-2 text-xs font-normal">
          ({usage?.used_chars || 0}/{usage?.allocated_chars || 1000} chars)
        </span>
      </span>
      {isFreePlan && (
        <Link
          to="/pricing"
          className="px-3 py-1 text-xs font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
        >
          Upgrade
          <span className="inline-block w-3.5 h-3.5">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path d="M13 3L16.293 6.293L9.293 13.293L10.707 14.707L17.707 7.707L21 11V3H13Z" fill="currentColor"/>
              <path d="M19 19H5V5H12L10 3H5C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V14L19 12V19Z" fill="currentColor"/>
            </svg>
          </span>
        </Link>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            {user.email?.[0].toUpperCase() || 'U'}
          </span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <Link
              to="/account"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </Link>

            <button
              onClick={() => {
                signOut();
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header className="flex items-center justify-end pl-0 pr-4 py-2">
      {navControls}
    </header>
  );
};