import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PLANS, createCheckoutSession } from '../lib/stripe';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const Pricing = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(priceId);
    setError(null);
    
    try {
      await createCheckoutSession(priceId);
      // Refresh both subscription and usage data
      const store = useSubscriptionStore.getState();
      await store.fetchSubscription();
      await store.fetchUsage(user.id);
    } catch (error) {
      console.error('Subscription Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start subscription process');
    } finally {
      setIsLoading(null);
    }
  };

  const getCurrentPlanKey = () => {
    return subscription ? subscription.plan : null;
  };

  const currentPlanKey = getCurrentPlanKey();

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

        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-xl text-gray-600">
                Choose the plan that's right for you
              </p>
            </div>

            {error && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(PLANS).map(([key, plan]) => {
                const isCurrentPlan = currentPlanKey === key;
                
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 flex flex-col ${
                      key === 'premium+' ? 'relative' : ''
                    }`}
                  >
                    {key === 'premium+' && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-8 flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
                      
                      <p className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="ml-1 text-sm font-semibold text-gray-500">
                          /month
                        </span>
                      </p>

                      <ul className="mt-8 space-y-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="ml-3 text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-8 pt-0">
                      {isCurrentPlan ? (
                        <div className="block w-full rounded-lg bg-gray-100 px-6 py-3 text-center text-sm font-semibold text-gray-900">
                          Current Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                          disabled={isLoading === plan.priceId || !plan.priceId}
                          className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold ${
                            key === 'FREE'
                              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                              : 'bg-black text-white hover:bg-gray-800'
                          } disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                        >
                          {isLoading === plan.priceId
                            ? 'Processing...'
                            : plan.price === 0
                            ? 'Get Started'
                            : 'Subscribe'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};