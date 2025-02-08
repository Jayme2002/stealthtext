import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Brain, CreditCard } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { PLANS } from '../lib/stripe';

export const Account = () => {
  const subscription = useSubscriptionStore((state) => state.subscription);

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to open subscription management. Please try again.');
    }
  };

  const currentPlan = PLANS[subscription?.plan.toUpperCase() as keyof typeof PLANS];

  return (
    <div className="h-screen flex">
      <div className="fixed left-0 top-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 ml-64">
        <div className="fixed top-0 right-0 left-64 bg-white border-b border-gray-200 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Brain className="w-8 h-8" />
                <span className="ml-2 text-xl font-semibold">Account Settings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Subscription Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Current Plan</p>
                        <p className="text-sm text-gray-500">{currentPlan?.name || 'Free'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>

                  {subscription?.current_period_end && (
                    <div className="text-sm text-gray-500">
                      Next billing date:{' '}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={handleManageSubscription}
                      className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                    >
                      Manage Subscription
                    </button>
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