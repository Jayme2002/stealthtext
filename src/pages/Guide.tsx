import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { HelpCircle, CheckCircle, AlertTriangle, Sparkles, Brain, Shield, RefreshCw, FileCheck, Pencil } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import MobileGuide from './MobileGuide';

export const Guide = () => {
  const isMobileView = useUIStore(state => state.isMobileView);

  // If on mobile view, render the mobile-specific version
  if (isMobileView) {
    return <MobileGuide />;
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

        <div className="pt-16" style={{ marginLeft: "250px" }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Guide</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-300">Learn how to get the most out of StealthText</p>
              </div>
            </div>

            {/* Getting Started Section */}
            <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                Getting Started
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  StealthText helps you transform AI-generated content into natural, human-like text. Here's how to get started:
                </p>
                <ol className="list-decimal pl-4 space-y-2 mt-4">
                  <li>Navigate to the Humanizer page</li>
                  <li>Paste your AI-generated text into the input box</li>
                  <li>Select your desired humanization intensity</li>
                  <li>Click "Humanize" to process your text</li>
                  <li>Review and refine the output as needed</li>
                </ol>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Best Practices
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FileCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">Review Before Processing</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Clean up obvious errors and formatting issues in your text before humanizing. This helps ensure better results.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">Start with Medium Intensity</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Begin with medium intensity and adjust based on results. High intensity makes more significant changes but may require more review.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">Verify with AI Detection</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Use our AI Detection tool to check your humanized text and ensure it meets your requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Important Notes
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-yellow-800 dark:text-yellow-300 mb-2">Multiple Attempts May Be Needed</h3>
                  <p className="text-yellow-700 dark:text-yellow-200 text-sm">
                    Some text may require multiple humanization attempts to achieve optimal results. This is normal and part of the process.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-blue-800 dark:text-blue-300 mb-2">Grammar and Style</h3>
                  <p className="text-blue-700 dark:text-blue-200 text-sm">
                    While our tool maintains meaning, it may occasionally introduce grammatical variations. Always review the output for clarity and correctness.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-purple-800 dark:text-purple-300 mb-2">Content Length</h3>
                  <p className="text-purple-700 dark:text-purple-200 text-sm">
                    Process text in reasonable chunks for best results. Very long texts may be better handled in sections.
                  </p>
                </div>
              </div>
            </div>

            {/* Optimization Tips */}
            <div className="bg-white dark:bg-dark-700 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-500" />
                Optimization Tips
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">For Best Results:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5">
                        <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        <strong>Iterate and Refine:</strong> Don't hesitate to run the text through multiple passes with different intensity levels.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5">
                        <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        <strong>Break Up Long Content:</strong> For texts over 1000 words, consider processing in smaller sections and then combining.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5">
                        <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        <strong>Maintain Context:</strong> Ensure each section maintains proper context when processing in parts.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5">
                        <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        <strong>Final Review:</strong> Always perform a final review of the complete text to ensure coherence and flow.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};