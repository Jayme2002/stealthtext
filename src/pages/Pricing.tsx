import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Star, Zap, User } from 'lucide-react';
import { PLANS, createCheckoutSession } from '../lib/stripe';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LandingHeader } from '../components/LandingHeader';
import { useUIStore } from '../store/uiStore';
import MobilePricing from './MobilePricing';

export const Pricing = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const isMobileView = useUIStore(state => state.isMobileView);

  // If on mobile view and user is logged in, render mobile pricing
  if (isMobileView && user) {
    return <MobilePricing />;
  }

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(priceId);
    setError(null);
    
    try {
      await createCheckoutSession(priceId);
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

  const getPlanIcon = (key: string) => {
    switch (key) {
      case 'free': return <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
      case 'premium': return <Crown className="w-6 h-6 text-purple-500" />;
      case 'premium+': return <Star className="w-6 h-6 text-yellow-500" />;
      case 'pro': return <Zap className="w-6 h-6 text-blue-500" />;
      default: return null;
    }
  };

  const getPlanGradient = (key: string) => {
    switch (key) {
      case 'premium': return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'premium+': return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      case 'pro': return 'bg-gradient-to-br from-blue-500 to-indigo-500';
      default: return 'bg-gray-100 dark:bg-dark-700';
    }
  };

  const PricingContent = () => (
    <div className="pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Choose your word limit
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Scale your content humanization with our flexible plans
          </p>
        </div>

        {error && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 justify-center">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = currentPlanKey === key;
            const planIcon = getPlanIcon(key);
            const gradientClass = getPlanGradient(key);
            
            return (
              <div
                key={key}
                className={`bg-white dark:bg-dark-700 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-dark-600 flex flex-col ${
                  key === 'premium+' ? 'relative' : ''
                }`}
              >
                {key === 'premium+' && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-black dark:bg-white dark:text-dark-800 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {planIcon}
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
                  </div>
                  
                  <div className={`mt-4 p-4 rounded-lg ${gradientClass} ${key === 'free' ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                    <div className="text-4xl font-bold tracking-tight">
                      ${plan.price}
                    </div>
                    <div className="text-sm opacity-90 mt-1">per month</div>
                  </div>

                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        {key === 'free' ? '250 words per month' : 
                         key === 'premium' ? '10,000 words per month' : 
                         key === 'premium+' ? '25,000 words per month' : 
                         '50,000 words per month'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        {key === 'free' ? 'Up to 250 words per request' : 
                         key === 'premium' ? 'Up to 500 words per request' : 
                         key === 'premium+' ? 'Up to 1,000 words per request' : 
                         'Up to 2,000 words per request'}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-8 pt-0">
                  {isCurrentPlan ? (
                    <div className="block w-full rounded-lg bg-gray-100 dark:bg-dark-600 px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                      disabled={isLoading === plan.priceId || !plan.priceId}
                      className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold ${
                        key === 'free'
                          ? 'bg-gray-100 dark:bg-dark-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-500'
                          : 'bg-black dark:bg-white dark:text-dark-800 text-white hover:bg-gray-800 dark:hover:bg-gray-200'
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
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-800">
        <LandingHeader />
        <PricingContent />
      </div>
    );
  }

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
        <main style={{ marginLeft: "250px" }}>
          <PricingContent />
        </main>
      </div>
    </div>
  );
};