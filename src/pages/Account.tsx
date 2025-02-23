import React from 'react';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { Brain, CreditCard, Loader2 } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getPlanName } from '../utils/subscriptionPlanMapping';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';

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
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      const data = await response.json();

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

  const currentPlan = subscription ? getPlanName(subscription.plan) : 'Free';
  const hasActiveSubscription = subscription?.status === 'active' && subscription.plan !== 'free' && !subscription?.cancel_at;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <div className="flex-1">
        <div className="fixed top-0 right-0 left-0 bg-white border-b border-gray-200 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16 items-center w-full">
              <Navbar />
            </div>
          </div>
        </div>

        <div className="pt-16" style={{ marginLeft: width }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Subscription Details</h2>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Current Plan</p>
                        <p className="text-sm text-gray-500">{currentPlan}</p>
                      </div>
                    </div>
                    {hasActiveSubscription && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>

                  {subscription?.current_period_end && (
                    <div className="text-sm text-gray-500">
                      {subscription?.cancel_at ? "Subscription ending: " : "Next billing date: "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </div>
                  )}

                  <div className="pt-4">
                    {hasActiveSubscription ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Opening Portal...
                          </>
                        ) : (
                          'Manage Subscription'
                        )}
                      </button>
                    ) : (
                      <a
                        href="/pricing"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                      >
                        Upgrade Plan
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};