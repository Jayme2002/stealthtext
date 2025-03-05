import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Copy, Check, Sparkles, Crown, Star, Zap, ArrowRight } from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';

export const Home = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const features = [
    {
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      title: "Premium Plans",
      description: "Choose from flexible word limits that fit your needs"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Advanced Detection",
      description: "Get detailed AI detection scores for your content"
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      title: "Instant Results",
      description: "Transform your content in seconds with our powerful API"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      
      <main>
        {/* Hero Section */}
        <div className="relative pt-16 sm:pt-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
                Make Your AI Content
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"> Undetectable</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
                Transform AI-generated content into natural, human-like text that bypasses AI detection with our advanced humanization technology.
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 shadow-sm transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Try For Free
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Pricing
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Editor Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-14">
              {/* Input Box */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center text-gray-700">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2">Original Text</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full h-[200px] sm:h-[250px] md:h-[300px] p-3 sm:p-4 pr-10 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="Paste your AI-generated text here..."
                    />
                    <button
                      onClick={() => copyToClipboard(text)}
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {showCopyTooltip ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Preview */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center text-gray-700">
                      <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2">Humanized Preview</span>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      readOnly
                      className="w-full h-[200px] sm:h-[250px] md:h-[300px] p-3 sm:p-4 pr-10 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                      placeholder="Sign up to see your humanized text here..."
                    />
                  </div>
                  <div className="mt-3 sm:mt-4 flex justify-end">
                    <Link
                      to="/signup"
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Try For Free
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-14">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    {feature.icon}
                    <h3 className="ml-3 text-base sm:text-lg font-medium text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Ready to humanize your content?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Join thousands of content creators who trust StealthText for their content needs.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 shadow-sm transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};