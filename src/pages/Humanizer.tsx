import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { Copy, Loader2, Check } from 'lucide-react';
import { humanizeText, checkForAI } from '../lib/openai';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface HumanizedResult {
  text: string;
  aiScore: number;
}

const Humanizer = () => {
  const [searchParams] = useSearchParams();
  const fetchSubscription = useSubscriptionStore((state) => state.fetchSubscription);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const user = useAuthStore((state) => state.user);
  const { width } = useSidebar();
  
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      fetchSubscription();
    }
  }, [searchParams, fetchSubscription]);

  const [text, setText] = useState('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizedResult, setHumanizedResult] = useState<HumanizedResult | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  const handleHumanize = async () => {
    if (!text.trim() || !user) return;

    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    const { canProceed, error } = await useSubscriptionStore.getState().checkUsage(
      user.id, 
      charCount,
      wordCount
    );
    
    if (error || !canProceed) {
      alert('Monthly limit exceeded for characters or words');
      return;
    }

    setIsHumanizing(true);
    try {
      const humanizedText = await humanizeText(text);
      const aiScore = await checkForAI(humanizedText);
      setHumanizedResult({ text: humanizedText, aiScore });
      useSubscriptionStore.getState().fetchUsage(user.id);
    } catch (error) {
      console.error('Humanization failed:', error);
      alert('Humanization failed. Please try again.');
    } finally {
      setIsHumanizing(false);
    }
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <div className="fixed top-0 right-0 bg-white border-b border-gray-200 z-10" style={{ left: width }}>
          <div className="max-w-[1656px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16 items-center">
              <Navbar />
            </div>
          </div>
        </div>

        <div className="pt-16 min-h-screen" style={{ marginLeft: width }}>
          <div className="max-w-[1656px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Input Box */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full h-[575px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                    <button
                      onClick={handleHumanize}
                      disabled={isHumanizing || !text.trim()}
                      className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isHumanizing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Humanizing...
                        </>
                      ) : (
                        'Humanize'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Box */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="relative">
                    <textarea
                      value={humanizedResult?.text || ''}
                      readOnly
                      className="w-full h-[575px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Humanized text will appear here..."
                    />
                    {humanizedResult && (
                      <button
                        onClick={() => copyToClipboard(humanizedResult.text)}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {showCopyTooltip ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {humanizedResult?.text.length || 0} characters | {humanizedResult?.text.split(/\s+/).filter(Boolean).length || 0} words
                    </div>
                    {humanizedResult && (
                      <button
                        onClick={handleHumanize}
                        disabled={isHumanizing}
                        className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Re-Humanize
                      </button>
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

export default Humanizer;