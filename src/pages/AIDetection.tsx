import React, { useState, useEffect } from 'react';
import { Sidebar, useSidebar } from '../components/Sidebar';
import { Copy, Loader2, Check, AlertCircle, Sparkles, FileText, Shield, User, X } from 'lucide-react';
import { detectAI, AIDetectionResult } from '../lib/openai';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import MobileAIDetection from './MobileAIDetection';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';

const AIDetection = () => {
  const { width, isMobile } = useSidebar();
  const isMobileView = useUIStore(state => state.isMobileView);
  const user = useAuthStore((state) => state.user);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);

  // If on mobile view, render the mobile-specific version
  if (isMobileView) {
    return <MobileAIDetection />;
  }

  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<AIDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [showWordLimitModal, setShowWordLimitModal] = useState(false);
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'tools' | 'details'>('summary');

  // Calculate word count when text changes
  useEffect(() => {
    const wordCount = text.trim() ? text.split(/\s+/).filter(Boolean).length : 0;
    setCurrentWordCount(wordCount);
  }, [text]);

  const handleDetect = async () => {
    if (!text.trim() || !user) return;
    setError(null);

    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
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
    
    if (remainingWords <= 0) {
      setError("You've reached your monthly word limit. Please upgrade your plan or wait until your allocation resets.");
      return;
    } else if (wordCount > remainingWords) {
      setError(`Not enough words remaining. You're trying to analyze ${wordCount} words but only have ${remainingWords} words left in your allocation.`);
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
      setError("You've reached your usage limit. Please upgrade your plan or wait until your allocation resets.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await detectAI(text);
      if (result) {
        setDetectionResult(result);
        // Update usage data
        useSubscriptionStore.getState().fetchUsage(user.id);
      } else {
        setError('Failed to analyze text. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const getOverallScore = () => {
    if (!detectionResult) return { ai: 0, human: 0, mixed: 0 };
    
    // Average scores from all tools
    const tools = [
      'turnitin', 'openai', 'gptzero', 'writer', 'crossplag',
      'copyleaks', 'sapling', 'contentatscale', 'zerogpt', 'human'
    ];
    
    let aiTotal = 0;
    let humanTotal = 0;
    let mixedTotal = 0;
    let toolCount = 0;
    
    for (const tool of tools) {
      if (detectionResult[tool as keyof AIDetectionResult]) {
        const scores = detectionResult[tool as keyof AIDetectionResult] as { ai: number, human: number, mixed: number };
        aiTotal += scores.ai;
        humanTotal += scores.human;
        mixedTotal += scores.mixed;
        toolCount++;
      }
    }
    
    if (toolCount === 0) return { ai: 0, human: 0, mixed: 0 };
    
    return {
      ai: Math.round((aiTotal / toolCount) * 100),
      human: Math.round((humanTotal / toolCount) * 100),
      mixed: Math.round((mixedTotal / toolCount) * 100)
    };
  };

  const getScoreColor = (score: number) => {
    if (score <= 33) return 'text-green-500';
    if (score <= 66) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score <= 33) return 'bg-green-100 dark:bg-green-900/30';
    if (score <= 66) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getScoreDescription = (aiScore: number) => {
    if (aiScore <= 15) return 'This content appears to be primarily human-written.';
    if (aiScore <= 40) return 'This content shows minimal signs of AI generation.';
    if (aiScore <= 60) return 'This content shows mixed signals of both human and AI writing.';
    if (aiScore <= 85) return 'This content shows strong indicators of AI generation.';
    return 'This content appears to be primarily AI-generated.';
  };

  const getScoreAction = (aiScore: number) => {
    if (aiScore <= 40) return 'Good to go! This content should pass AI detection tools.';
    if (aiScore <= 65) return 'Consider using our Humanizer tool to make this content more human-like.';
    return 'Use our Humanizer tool to significantly reduce AI detection signals.';
  };

  const overallScore = getOverallScore();
  
  // Prepare chart data for tools comparison
  const prepareToolsData = () => {
    if (!detectionResult) return [];
    
    const tools = [
      'turnitin', 'openai', 'gptzero', 'writer', 'crossplag',
      'copyleaks', 'sapling', 'contentatscale', 'zerogpt', 'human'
    ];
    
    return tools.map(tool => {
      const toolKey = tool as keyof AIDetectionResult;
      const toolData = detectionResult[toolKey] as { ai: number, human: number, mixed: number } | undefined;
      
      if (!toolData) {
        return {
          name: tool.charAt(0).toUpperCase() + tool.slice(1),
          AI: 0,
          Human: 0,
          Mixed: 0
        };
      }
      
      return {
        name: tool.charAt(0).toUpperCase() + tool.slice(1),
        AI: Math.round(toolData.ai * 100),
        Human: Math.round(toolData.human * 100),
        Mixed: Math.round(toolData.mixed * 100)
      };
    });
  };
  
  // Prepare radar chart data
  const prepareRadarData = () => {
    if (!detectionResult) return [];
    
    const tools = [
      'turnitin', 'openai', 'gptzero', 'writer', 'crossplag',
      'copyleaks', 'sapling', 'contentatscale', 'zerogpt'
    ];
    
    return [
      {
        subject: 'Human Score',
        A: Math.round(overallScore.human),
        fullMark: 100
      },
      {
        subject: 'AI Score',
        A: Math.round(overallScore.ai),
        fullMark: 100
      },
      {
        subject: 'Mixed Score',
        A: Math.round(overallScore.mixed),
        fullMark: 100
      },
      ...tools.map(tool => {
        const toolKey = tool as keyof AIDetectionResult;
        const toolData = detectionResult[toolKey] as { ai: number, human: number, mixed: number } | undefined;
        
        return {
          subject: tool.charAt(0).toUpperCase() + tool.slice(1),
          A: toolData ? Math.round(toolData.ai * 100) : 0,
          fullMark: 100
        };
      })
    ];
  };

  const toolsData = prepareToolsData();
  const radarData = prepareRadarData();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-800">
      <Sidebar />
      
      {/* Word Limit Modal */}
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
                  onClick={() => {
                    setShowWordLimitModal(false);
                    window.location.href = '/pricing';
                  }}
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
            {/* Header Section */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">AI Detection</h1>
                  <p className="mt-0.5 text-sm md:text-base text-gray-600 dark:text-gray-300">Check content to determine if it was written by AI or a human.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input Box */}
              <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-dark-600">
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2 text-sm md:text-base">Text to Analyze</span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] xl:h-[400px] p-3 pr-10 border border-gray-200 dark:border-dark-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 dark:text-white"
                      placeholder="Paste text here to analyze for AI detection..."
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
                      onClick={handleDetect}
                      disabled={isAnalyzing || !text.trim()}
                      className="px-4 py-1.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 md:w-4 md:h-4" />
                          Detect AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Panel */}
              <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-dark-600">
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium ml-2 text-sm md:text-base">Analysis Results</span>
                    </div>
                  </div>
                  
                  {!detectionResult ? (
                    <div className="flex flex-col items-center justify-center h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] xl:h-[400px] p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600">
                      <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-center text-gray-500 dark:text-gray-400 mb-2">No Analysis Yet</p>
                      <p className="text-center text-sm text-gray-400 dark:text-gray-500 max-w-md">
                        Enter some text and click "Detect AI" to analyze if the content was written by an AI or a human.
                      </p>
                    </div>
                  ) : (
                    <div className="h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] xl:h-[400px] flex flex-col">
                      {/* Tabs for results */}
                      <div className="flex border-b border-gray-200 dark:border-dark-600 mb-4">
                        <button
                          onClick={() => setActiveTab('summary')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeTab === 'summary' 
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Summary
                        </button>
                        <button
                          onClick={() => setActiveTab('details')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeTab === 'details' 
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setActiveTab('tools')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeTab === 'tools' 
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Tools
                        </button>
                      </div>
                      
                      {/* Tab Content */}
                      <div className="flex-1 overflow-auto">
                        {activeTab === 'summary' && (
                          <div className="h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Overall Detection</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                  Average score from all detection tools
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <div className={`text-sm font-medium px-3 py-1 rounded-full ${getScoreBg(overallScore.ai)} ${getScoreColor(overallScore.ai)}`}>
                                  AI: {overallScore.ai}%
                                </div>
                                <div className={`text-sm font-medium px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500`}>
                                  Human: {overallScore.human}%
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 mb-4">
                              <div className="w-full h-4 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-300"
                                  style={{ width: `${overallScore.ai}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Likely Human</span>
                                <span>Mixed</span>
                                <span>Likely AI</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-600 rounded-lg">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analysis</h4>
                              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                                {getScoreDescription(overallScore.ai)}
                              </p>
                              
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendation</h4>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {getScoreAction(overallScore.ai)}
                              </p>
                              
                              {overallScore.ai > 40 && (
                                <div className="mt-4">
                                  <a 
                                    href="/humanizer" 
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-sm"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    Humanize This Text
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-auto">
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                                Results generated by analyzing text across multiple AI detection tools.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {activeTab === 'details' && (
                          <div className="h-full flex flex-col space-y-4 overflow-y-auto p-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 dark:bg-dark-600 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sentence Analysis</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                  {detectionResult.sentences.map((sentence, index) => (
                                    <div 
                                      key={index} 
                                      className={`text-xs p-2 rounded-lg border ${
                                        sentence.generatedProb > 0.7 
                                          ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20' 
                                          : sentence.generatedProb > 0.3
                                            ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                                            : 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                      }`}
                                    >
                                      <p className="text-gray-800 dark:text-gray-200">{sentence.sentence}</p>
                                      <div className="flex justify-between mt-1 text-gray-500 dark:text-gray-400">
                                        <span>AI Probability: {Math.round(sentence.generatedProb * 100)}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-dark-600 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Detection Tools</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                  {Object.entries(detectionResult)
                                    .filter(([key]) => key !== 'sentences' && typeof detectionResult[key as keyof AIDetectionResult] === 'object')
                                    .map(([key, value]) => {
                                      const scores = value as { ai: number, human: number, mixed: number };
                                      const aiPercent = Math.round(scores.ai * 100);
                                      const humanPercent = Math.round(scores.human * 100);
                                      return (
                                        <div key={key} className="text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-700">
                                          <div className="flex justify-between mb-1">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                              {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </span>
                                            <span className={`${getScoreColor(aiPercent)}`}>
                                              AI: {aiPercent}%
                                            </span>
                                          </div>
                                          <div className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-gradient-to-r from-green-500 to-red-500"
                                              style={{ width: `${aiPercent}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  }
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-dark-600 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Radar Analysis</h4>
                              <div className="h-[200px] overflow-hidden">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart outerRadius={90} width={730} height={250} data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <Radar name="AI Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {activeTab === 'tools' && (
                          <div className="h-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={toolsData}
                                margin={{
                                  top: 20,
                                  right: 20,
                                  left: 20,
                                  bottom: 20,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="AI" name="AI Score" fill="#3b82f6" />
                                <Bar dataKey="Human" name="Human Score" fill="#10b981" />
                                <Bar dataKey="Mixed" name="Mixed Score" fill="#f59e0b" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDetection;