import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut, Crown, Zap, Star, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getPlanName } from '../utils/subscriptionPlanMapping';
import { PLANS } from '../lib/stripe';

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
  const PlanIcon = isFreePlan ? User : 
                  subscription?.plan === 'premium' ? Crown :
                  subscription?.plan === 'premium+' ? Star : Zap;

  const getPlanColor = () => {
    if (isFreePlan) return 'bg-gray-100 text-gray-700';
    switch (subscription?.plan) {
      case 'premium': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'premium+': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'pro': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUsagePercentage = () => {
    if (!usage) return 0;
    return Math.round((usage.used_words / usage.allocated_words) * 100);
  };

  const usagePercentage = getUsagePercentage();

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
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getPlanColor()} shadow-sm`}>
        <PlanIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {subscription ? getPlanName(subscription.plan) : 'Free'}
        </span>
        {!isFreePlan && (
          <>
            <div className="h-4 w-px bg-white/30 mx-2" />
            <div className="flex items-center gap-1.5">
              <div className="text-xs font-medium">
                {usage?.used_words || 0}/{usage?.allocated_words || PLANS.free.monthly_words}
              </div>
              <div className="w-16 h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/90 rounded-full transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {isFreePlan && (
        <Link
          to="/pricing"
          className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5" />
          Upgrade
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
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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