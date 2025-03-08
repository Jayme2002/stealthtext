import React from 'react';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { CreditCard, Loader2, Crown, Star, Zap, User, Clock, ArrowRight } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getPlanName } from '../utils/subscriptionPlanMapping';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { PLANS } from '../lib/stripe';
import { Link } from 'react-router-dom';

export const Account = () => {
  const subscription = useSubscriptionStore((state) => state.subscription);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { width } = useSidebar();

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No active session found. Please log in.");
        setIsLoading(false);
        return;
      }
      
      const token = session.access_token;
      
      // Simple retry logic
      let retryAttempts = 0;
      const maxRetries = 2;
      let response;
      
      while (retryAttempts <= maxRetries) {
        try {
          response = await fetch('https://qbdzfdqnnhdprwvdnlkn.supabase.co/functions/v1/create-portal-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include'
          });
          break; // If successful, exit the loop
        } catch (error) {
          retryAttempts++;
          if (retryAttempts > maxRetries) throw error;
          console.log(`Retrying portal session request, attempt ${retryAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }

      if (!response) {
        throw new Error('Failed to make API request after retries');
      }

      // Better error handling
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open subscription portal');
      }

      if (!data.url) {
        throw new Error('No portal URL received');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to open subscription management');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = () => {
    if (!subscription || subscription.plan === 'free') {
      return <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
    }
    switch (subscription.plan) {
      case 'premium':
        return <Crown className="w-6 h-6 text-purple-500" />;
      case 'premium+':
        return <Star className="w-6 h-6 text-yellow-500" />;
      case 'pro':
        return <Zap className="w-6 h-6 text-blue-500" />;
      default:
        return <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
    }
  };

  const getPlanGradient = () => {
    if (!subscription || subscription.plan === 'free') {
      return 'bg-gray-100 dark:bg-dark-700';
    }
    switch (subscription.plan) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'premium+':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'pro':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      default:
        return 'bg-gray-100 dark:bg-dark-700';
    }
  };

  const currentPlan = subscription ? getPlanName(subscription.plan) : 'Free';
  const hasActiveSubscription = subscription?.status === 'active' && subscription.plan !== 'free' && !subscription?.cancel_at;
  const planDetails = PLANS[subscription?.plan || 'free'];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-800">
      <Sidebar />

      <div className="flex-1">
        <div className="fixed top-0 right-0 left-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16 items-center w-full">
              <Navbar />
            </div>
          </div>
        </div>

        <div className="pt-16" style={{ marginLeft: width }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">Manage your subscription and account preferences</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Current Plan Card */}
              <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Current Plan</h2>
                  
                  <div className={`p-6 rounded-lg ${getPlanGradient()} ${subscription?.plan === 'free' ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPlanIcon()}
                        <div>
                          <h3 className="text-lg font-semibold">{currentPlan}</h3>
                          <p className="text-sm opacity-90">
                            {planDetails.monthly_words.toLocaleString()} words per month
                          </p>
                        </div>
                      </div>
                      {hasActiveSubscription ? (
                        <div className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                          Active
                        </div>
                      ) : subscription?.cancel_at && (
                        <div className="px-3 py-1 rounded-full bg-black/10 dark:bg-black/30 text-sm font-medium">
                          Cancels {new Date(subscription.cancel_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subscription Management */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-600">
                    {hasActiveSubscription ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-dark-800 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Opening Portal...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Manage Subscription
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to="/pricing"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-dark-800 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing History */}
              {hasActiveSubscription && (
                <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing History</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 inline-block mr-1.5 text-gray-400 dark:text-gray-500" />
                      Next billing date: {subscription.current_period_end && 
                        new Date(subscription.current_period_end).toLocaleDateString()
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};