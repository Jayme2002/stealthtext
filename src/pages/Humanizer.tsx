import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { Copy, Loader2, Check, AlertCircle, Sparkles, FileText, Bot, User, Sliders, X } from 'lucide-react';
import { humanizeText, checkForAI, HumanizerIntensity } from '../lib/openai';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/authStore';

interface HumanizedResult {
  text: string;
  aiScore: number;
}

const Humanizer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetchSubscription = useSubscriptionStore((state) => state.fetchSubscription);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);
  const user = useAuthStore((state) => state.user);
  const { width, isMobile } = useSidebar();
  
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
  const [error, setError] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<HumanizerIntensity>('HIGH');
  const [showWordLimitModal, setShowWordLimitModal] = useState(false);
  const [showMonthlyLimitModal, setShowMonthlyLimitModal] = useState(false);
  const [currentWordCount, setCurrentWordCount] = useState(0);

  // Calculate word count when text changes
  useEffect(() => {
    const wordCount = text.trim() ? text.split(/\s+/).filter(Boolean).length : 0;
    setCurrentWordCount(wordCount);
  }, [text]);

  const handleHumanize = async () => {
    if (!text.trim() || !user) return;
    setError(null);

    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    // Check if word count exceeds max request limit
    if (usage && usage.max_request_words && wordCount > usage.max_request_words) {
      setShowWordLimitModal(true);
      return;
    }
    
    const { canProceed, error } = await useSubscriptionStore.getState().checkUsage(
      user.id, 
      charCount,
      wordCount
    );
    
    if (!canProceed) {
      setShowMonthlyLimitModal(true);
      return;
    }

    setIsHumanizing(true);
    try {
      const humanizedText = await humanizeText(text, intensity);
      const aiScore = await checkForAI(humanizedText);
      setHumanizedResult({ text: humanizedText, aiScore });
      useSubscriptionStore.getState().fetchUsage(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to humanize text. Please try again.');
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    setShowWordLimitModal(false);
    setShowMonthlyLimitModal(false);
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score <= 20) return 'text-green-500';
    if (score <= 45) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getIntensityGradient = (level: HumanizerIntensity) => {
    switch (level) {
      case 'LOW':
        return intensity === 'LOW' 
          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'MEDIUM':
        return intensity === 'MEDIUM'
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'HIGH':
        return intensity === 'HIGH'
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      {/* Single Request Word Limit Modal */}
      {showWordLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowWordLimitModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-5">
              <div className="mx-auto bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Word Limit Exceeded</h3>
              <p className="text-sm text-gray-600 mb-4">
                You've exceeded the word limit for a single request. Your current plan allows 
                <span className="font-semibold"> {usage?.max_request_words || 250} words </span> 
                per request, but you're trying to process 
                <span className="font-semibold"> {currentWordCount} words</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowWordLimitModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Reduce Text
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Word Limit Modal - New */}
      {showMonthlyLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowMonthlyLimitModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-5">
              <div className="mx-auto bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Word Limit Reached</h3>
              <p className="text-sm text-gray-600 mb-4">
                You've used all your words for this month ({usage?.allocated_words || 500} words).
                Your usage resets on the 1st of next month, or you can upgrade your plan to get more words immediately.
              </p>
              
              {/* Progress bar showing usage */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-2.5 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mb-5">
                <span>Used: {usage?.used_words || 0}</span>
                <span>Total: {usage?.allocated_words || 500}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowMonthlyLimitModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          className={`${isMobile ? 'pt-4' : 'pt-16'} min-h-screen`} 
          style={{ marginLeft: isMobile ? '0' : width }}
        >
          <div className="max-w-[1656px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-20">
            {/* Header Section - More compact */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">AI Text Humanizer</h1>
                  <p className="mt-0.5 text-sm md:text-base text-gray-600">Transform AI-generated content into natural, human-like text.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Intensity Selector - More compact */}
            <div className="mb-4 bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-200">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4">
                <div className="flex items-center text-gray-700">
                  <Sliders className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="text-sm md:text-base font-medium">Humanization Intensity</span>
                </div>
                <div className="flex gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 shadow-sm ${getIntensityGradient(level)}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="w-full md:w-auto md:ml-2 text-xs md:text-sm text-gray-500 mt-2 md:mt-0">
                  {intensity === 'LOW' && 'Subtle changes while maintaining original style'}
                  {intensity === 'MEDIUM' && 'Balanced humanization with moderate adjustments'}
                  {intensity === 'HIGH' && 'Maximum humanization with significant rewrites'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input Box - Reduced height */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700">
                      <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2 text-sm md:text-base">AI Text</span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">
                      {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] xl:h-[400px] p-3 pr-10 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="Paste your AI-generated text here..."
                    />
                    <button
                      onClick={() => copyToClipboard(text)}
                      className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {showCopyTooltip ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => setText('')}
                      className="text-xs md:text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear text
                    </button>
                    <button
                      onClick={handleHumanize}
                      disabled={isHumanizing || !text.trim()}
                      className="px-4 py-1.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-sm"
                    >
                      {isHumanizing ? (
                        <>
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          Humanizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                          Humanize
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Box - Reduced height */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700">
                      <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2 text-sm md:text-base">Humanized Text</span>
                    </div>
                    {humanizedResult && (
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-gray-500" />
                        <span className="text-xs md:text-sm text-gray-500">
                          {humanizedResult.text.length} chars | {humanizedResult.text.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      value={humanizedResult?.text || ''}
                      readOnly
                      className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] xl:h-[400px] p-3 pr-10 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                      placeholder="Humanized text will appear here..."
                    />
                    {humanizedResult && (
                      <button
                        onClick={() => copyToClipboard(humanizedResult.text)}
                        className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {showCopyTooltip ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    {humanizedResult && (
                      <div className="flex items-center">
                        <span className="text-xs md:text-sm text-gray-600 mr-2">AI Detection Score:</span>
                        <span className={`text-xs md:text-sm font-medium ${getScoreColor(humanizedResult.aiScore)}`}>
                          {humanizedResult.aiScore}%
                        </span>
                      </div>
                    )}
                    {humanizedResult && (
                      <button
                        onClick={handleHumanize}
                        disabled={isHumanizing}
                        className="px-4 py-1.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg hover:from-green-600 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
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