import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Copy, Check } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-8">
              Humanize AI Generated Content
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              StealthText is an SEO tool that converts AI generated content into human-like content. Get better content & get 100% human score.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-3 text-lg font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Try For Free
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Input Box */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-[400px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="Enter your text here..."
                  />
                  <button
                    onClick={() => copyToClipboard(text)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {showCopyTooltip ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
                  </div>
                  <Link
                    to="/signup"
                    className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                  >
                    Humanize
                  </Link>
                </div>
              </div>
            </div>

            {/* Output Box */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="relative">
                  <textarea
                    readOnly
                    className="w-full h-[400px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 bg-gray-50"
                    placeholder="Sign up to see your humanized text here..."
                  />
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    0 characters | 0 words
                  </div>
                  <Link
                    to="/signup"
                    className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                  >
                    Try For Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};