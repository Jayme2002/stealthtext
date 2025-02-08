import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Copy, Loader2, Brain, Check } from 'lucide-react';
import { humanizeText, checkForAI } from '../lib/openai';

interface HumanizedResult {
  text: string;
  aiScore: number;
}

const Dashboard = () => {
  const [text, setText] = useState('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizedResult, setHumanizedResult] = useState<HumanizedResult | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  const handleHumanize = async () => {
    if (!text.trim()) return;
    
    setIsHumanizing(true);
    
    try {
      const humanizedText = await humanizeText(text);
      const aiScore = await checkForAI(humanizedText);
      
      setHumanizedResult({
        text: humanizedText,
        aiScore
      });
    } catch (error) {
      console.error('Error humanizing text:', error);
      alert('Failed to humanize text. Please try again.');
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
    <div className="h-screen flex">
      <div className="fixed left-0 top-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 ml-64">
        <div className="fixed top-0 right-0 left-64 bg-white border-b border-gray-200 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Brain className="w-8 h-8" />
                <span className="ml-2 text-xl font-semibold">StealthWriter</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Limited</span>
                <span className="text-sm text-gray-500">Free Plan</span>
                <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6">
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-64 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
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

            {/* Output Section */}
            {humanizedResult && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Humanized Text</h2>
                    <button
                      onClick={() => copyToClipboard(humanizedResult.text)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm text-gray-700"
                    >
                      {showCopyTooltip ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mb-6 p-6 bg-white border border-green-200 rounded-lg">
                    <h3 className="text-center text-lg font-semibold mb-4">AI Detection Summary</h3>
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="12"
                          strokeDasharray={`${(100 - humanizedResult.aiScore) * 5.53}, 553`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">{humanizedResult.aiScore}%</span>
                        <span className="text-sm text-gray-500">AI Detected</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {humanizedResult.text}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleHumanize}
                      disabled={isHumanizing}
                      className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isHumanizing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Re-Humanizing...
                        </>
                      ) : (
                        'Re-Humanize'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export { Dashboard }