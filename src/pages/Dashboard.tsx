import React from 'react';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Brain, Zap, Shield, Clock } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { width } = useSidebar();
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);

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
        <div className="fixed top-0 right-0 left-0 bg-white border-b border-gray-200 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16 items-center w-full">
              <Navbar />
            </div>
          </div>
        </div>

        <div className="pt-16" style={{ marginLeft: width }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to StealthText
                </h1>
                <p className="text-gray-600 mb-6">
                  Transform your AI-generated content into natural, human-like text that bypasses AI detection.
                </p>
                <Link
                  to="/humanizer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Start Humanizing
                </Link>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Words Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usage?.used_words || 0} / {usage?.allocated_words || 0}
                    </p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black rounded-full h-2" 
                        style={{ 
                          width: `${Math.min(((usage?.used_words || 0) / (usage?.allocated_words || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1) || 'Free'}
                    </p>
                    {subscription?.plan === 'free' && (
                      <Link
                        to="/pricing"
                        className="text-sm text-black hover:text-gray-800 font-medium mt-2 inline-block"
                      >
                        Upgrade Now →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {feature.icon}
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">
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