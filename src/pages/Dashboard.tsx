import React from 'react';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Brain, Zap, Shield, Clock, Sparkles, Crown, Star, User } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { width, isMobile } = useSidebar();
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);

  const getPlanGradient = () => {
    if (!subscription || subscription.plan === 'free') {
      return 'bg-gray-100 text-gray-900';
    }
    switch (subscription.plan) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'premium+':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'pro':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getPlanIcon = () => {
    if (!subscription || subscription.plan === 'free') {
      return <User className="w-5 h-5 text-gray-500" />;
    }
    switch (subscription.plan) {
      case 'premium':
        return <Crown className="w-5 h-5 text-white" />;
      case 'premium+':
        return <Star className="w-5 h-5 text-white" />;
      case 'pro':
        return <Zap className="w-5 h-5 text-white" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      title: "Advanced AI Detection",
      description: "Our AI detection system analyzes text patterns to ensure your content appears natural and human-written."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Fast Processing",
      description: "Get results in seconds with our optimized processing engine."
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Content Protection",
      description: "Your content is processed securely and never stored or shared."
    },
    {
      icon: <Clock className="w-6 h-6 text-green-500" />,
      title: "24/7 Availability",
      description: "Access our humanizer service anytime, anywhere."
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <div className="flex-1">
        {!isMobile && (
          <div className="fixed top-0 right-0 left-0 bg-white border-b border-gray-200 z-10">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex justify-end h-16 items-center w-full">
                <Navbar />
              </div>
            </div>
          </div>
        )}

        <div 
          className={`${isMobile ? 'pt-4' : 'pt-16'}`} 
          style={{ marginLeft: isMobile ? '0' : width }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-20 w-full overflow-x-hidden">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-4 md:p-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Welcome to StealthText
                </h1>
                <p className="text-gray-600 mb-6">
                  Transform your AI-generated content into natural, human-like text that bypasses AI detection.
                </p>
                <Link
                  to="/humanizer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Humanizing
                </Link>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Words Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usage?.used_words || 0} / {usage?.allocated_words || 0}
                    </p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-2 transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(((usage?.used_words || 0) / (usage?.allocated_words || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className={`rounded-lg p-4 ${getPlanGradient()}`}>
                    <div className="flex items-center gap-2">
                      {getPlanIcon()}
                      <p className="text-sm font-medium">Current Plan</p>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1) || 'Free'}
                    </p>
                    {subscription?.plan === 'free' && (
                      <Link
                        to="/pricing"
                        className="text-sm bg-black text-white px-3 py-1 rounded-lg mt-2 inline-flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        Upgrade Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 md:p-5">
                    <div className="flex items-center mb-3">
                      {feature.icon}
                      <h3 className="ml-3 text-base font-medium text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export { Dashboard };