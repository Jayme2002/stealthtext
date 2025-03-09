import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { Copy, Loader2, Check, AlertCircle, Sparkles, FileText, Bot, User, Sliders, X } from 'lucide-react';
import { humanizeText, checkForAI, HumanizerIntensity } from '../lib/openai';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { format, addMonths } from 'date-fns';
import { useUIStore } from '../store/uiStore';
import MobileHumanizer from './MobileHumanizer';

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
  const isMobileView = useUIStore(state => state.isMobileView);
  
  // If on mobile view, render the mobile-specific version
  if (isMobileView) {
    return <MobileHumanizer />;
  }
  
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
  const [showNotEnoughWordsModal, setShowNotEnoughWordsModal] = useState(false);
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [wordsRemaining, setWordsRemaining] = useState(0);

  // Calculate word count when text changes
  useEffect(() => {
    const wordCount = text.trim() ? text.split(/\s+/).filter(Boolean).length : 0;
    setCurrentWordCount(wordCount);
  }, [text]);

  const handleHumanize = async () => {
    if (!user) return;
    
    // Always use the text from the input box
    const textToProcess = text.trim();
    
    if (!textToProcess) return;
    setError(null);

    const charCount = textToProcess.length;
    const wordCount = textToProcess.split(/\s+/).filter(Boolean).length;
    
    // Check if we have usage data
    if (!usage) {
      return; // Can't proceed without knowing usage limits
    }
    
    // Check if word count exceeds max request limit (per-request limit)
    if (usage.max_request_words && wordCount > usage.max_request_words) {
      setShowWordLimitModal(true);
      return;
    }
    
    // Check if user has enough words left for this request
    const remainingWords = usage.allocated_words - usage.used_words;
    setWordsRemaining(remainingWords);
    
    if (remainingWords <= 0) {
      // User has no words left (reached monthly limit)
      setShowMonthlyLimitModal(true);
      return;
    } else if (wordCount > remainingWords) {
      // User has some words left, but not enough for this request
      setShowNotEnoughWordsModal(true);
      return;
    }
    
    // If we get here, user has enough words for this request
    const { canProceed, error } = await useSubscriptionStore.getState().checkUsage(
      user.id, 
      charCount,
      wordCount
    );
    
    if (!canProceed) {
      // This is a fallback in case our frontend calculation was wrong
      setShowMonthlyLimitModal(true);
      return;
    }

    setIsHumanizing(true);
    try {
      const humanizedText = await humanizeText(textToProcess, intensity);
      const aiScore = await checkForAI(humanizedText);
      setHumanizedResult({ text: humanizedText, aiScore });
      useSubscriptionStore.getState().fetchUsage(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to humanize text. Please try again.');
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleReHumanize = async () => {
    if (!user || !humanizedResult) return;
    
    // Always use the text from the output box
    const textToProcess = humanizedResult.text;
    
    setError(null);

    const charCount = textToProcess.length;
    const wordCount = textToProcess.split(/\s+/).filter(Boolean).length;
    
    // Check if we have usage data
    if (!usage) {
      return; // Can't proceed without knowing usage limits
    }
    
    // Check if word count exceeds max request limit (per-request limit)
    if (usage.max_request_words && wordCount > usage.max_request_words) {
      setShowWordLimitModal(true);
      return;
    }
    
    // Check if user has enough words left for this request
    const remainingWords = usage.allocated_words - usage.used_words;
    setWordsRemaining(remainingWords);
    
    if (remainingWords <= 0) {
      // User has no words left (reached monthly limit)
      setShowMonthlyLimitModal(true);
      return;
    } else if (wordCount > remainingWords) {
      // User has some words left, but not enough for this request
      setShowNotEnoughWordsModal(true);
      return;
    }
    
    // If we get here, user has enough words for this request
    const { canProceed, error } = await useSubscriptionStore.getState().checkUsage(
      user.id, 
      charCount,
      wordCount
    );
    
    if (!canProceed) {
      // This is a fallback in case our frontend calculation was wrong
      setShowMonthlyLimitModal(true);
      return;
    }

    setIsHumanizing(true);
    try {
      const humanizedText = await humanizeText(textToProcess, intensity);
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
    setShowNotEnoughWordsModal(false);
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
          : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600';
      case 'MEDIUM':
        return intensity === 'MEDIUM'
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600';
      case 'HIGH':
        return intensity === 'HIGH'
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
          : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600';
    }
  };

  // Function to calculate and format the next reset date
  const getNextResetDate = () => {
    if (!usage?.last_reset) return 'your next billing cycle';
    
    try {
      // Parse the last_reset timestamp and add one month
      const lastReset = new Date(usage.last_reset);
      const nextReset = addMonths(lastReset, 1);
      return format(nextReset, 'MMMM d, yyyy'); // e.g., "August 15, 2023"
    } catch (err) {
      console.error('Error calculating next reset date:', err);
      return 'your next billing cycle';
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-800">
      <Sidebar />
      
      {/* Single Request Word Limit Modal */}
      {showWordLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-700 rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowWordLimitModal(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-5">
              <div className="mx-auto bg-red-100 dark:bg-red-900/50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Word Limit Exceeded</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                You've exceeded the word limit for a single request. Your current plan allows 
                <span className="font-semibold"> {usage?.max_request_words || 250} words </span> 
                per request, but you're trying to process 
                <span className="font-semibold"> {currentWordCount} words</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowWordLimitModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-dark-800"
                >
                  Reduce Text
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-dark-800"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updated Monthly Word Limit Modal */}
      {showMonthlyLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-700 rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowMonthlyLimitModal(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-5">
              <div className="mx-auto bg-amber-100 dark:bg-amber-900/50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Monthly Word Limit Reached</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                You've used all {usage?.allocated_words || 500} words in your monthly allocation.
                Your usage will reset on <span className="font-semibold">{getNextResetDate()}</span>.
              </p>
              
              {/* Progress bar showing usage */}
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-2.5 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-5">
                <span>Used: {usage?.used_words || 0}</span>
                <span>Total: {usage?.allocated_words || 500}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowMonthlyLimitModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-dark-800"
                >
                  Close
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-dark-800"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Not Enough Words Left Modal */}
      {showNotEnoughWordsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-700 rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowNotEnoughWordsModal(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-5">
              <div className="mx-auto bg-blue-100 dark:bg-blue-900/50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Not Enough Words Remaining</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                You're trying to process <span className="font-semibold">{currentWordCount} words</span>, but you only have <span className="font-semibold">{wordsRemaining} words</span> remaining in your monthly allocation.
              </p>
              
              {/* Progress bar showing usage */}
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(((usage?.used_words || 0) / (usage?.allocated_words || 1)) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-5">
                <span>Used: {usage?.used_words || 0}</span>
                <span>Total: {usage?.allocated_words || 500}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowNotEnoughWordsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-dark-800"
                >
                  Reduce Text
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-dark-800"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="fixed top-0 right-0 left-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16 items-center w-full">
              <Navbar />
            </div>
          </div>
        </div>

        <div 
          className="pt-16" 
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
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">AI Text Humanizer</h1>
                  <p className="mt-0.5 text-sm md:text-base text-gray-600 dark:text-gray-300">Transform AI-generated content into natural, human-like text.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Intensity Selector - More compact */}
            <div className="mb-4 bg-white dark:bg-dark-700 rounded-xl shadow-sm p-3 md:p-4 border border-gray-200 dark:border-dark-600">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
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
                <div className="w-full md:w-auto md:ml-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                  {intensity === 'LOW' && 'Subtle changes while maintaining original style'}
                  {intensity === 'MEDIUM' && 'Balanced humanization with moderate adjustments'}
                  {intensity === 'HIGH' && 'Maximum humanization with significant rewrites'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input Box - Reduced height */}
              <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-dark-600">
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2 text-sm md:text-base">AI Text</span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] xl:h-[400px] p-3 pr-10 border border-gray-200 dark:border-dark-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-dark-700 dark:text-white"
                      placeholder="Paste your AI-generated text here..."
                    />
                    <button
                      onClick={() => copyToClipboard(text)}
                      className="absolute top-2 right-2 p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {showCopyTooltip ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => setText('')}
                      className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
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
              <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-dark-600">
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2 text-sm md:text-base">Humanized Text</span>
                    </div>
                    {humanizedResult && (
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          {humanizedResult.text.length} chars | {humanizedResult.text.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      value={humanizedResult?.text || ''}
                      readOnly
                      className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] xl:h-[400px] p-3 pr-10 border border-gray-200 dark:border-dark-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-dark-600 dark:text-white"
                      placeholder="Humanized text will appear here..."
                    />
                    {humanizedResult && (
                      <button
                        onClick={() => copyToClipboard(humanizedResult.text)}
                        className="absolute top-2 right-2 p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {showCopyTooltip ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    {humanizedResult && (
                      <div className="flex items-center">
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mr-2">AI Detection Score:</span>
                        <span className={`text-xs md:text-sm font-medium ${getScoreColor(humanizedResult.aiScore)}`}>
                          {humanizedResult.aiScore}%
                        </span>
                      </div>
                    )}
                    {humanizedResult && (
                      <button
                        onClick={handleReHumanize}
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