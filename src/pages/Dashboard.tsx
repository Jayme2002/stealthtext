import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="h-screen flex">
      <div className="fixed left-0 top-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 ml-64">
        <div className="fixed top-0 right-0 left-64 bg-white border-b border-gray-200 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16 items-center">
              <Navbar />
            </div>
          </div>
        </div>

        <div className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6">How to Use</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-6">
                    Quick guide to using our AI Humanizer
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">1. Generate AI Content</h3>
                      <p className="mt-2 text-gray-600">
                        Begin by generating AI content with a tool of your choice. For better results, use
                        premium models like GPT-4 or Claude 3.5 Opus/Sonnet.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">2. Clean the Text (optional)</h3>
                      <p className="mt-2 text-gray-600">
                        Remove Markdown or HTML formatting, special characters, numbers, or other
                        unwanted content.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">3. Select the Model</h3>
                      <p className="mt-2 text-gray-600">
                        Choose between Ninja or Ghost. Ghost generally provides better overall text
                        quality and detection scores.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">4. Choose the Level of Humanization</h3>
                      <p className="mt-2 text-gray-600">
                        Select a level from 1 to 10. Start with level 7 and adjust as needed.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">5. Humanize the Text</h3>
                      <p className="mt-2 text-gray-600">
                        Click Humanize to process the text. Review the humanized content and
                        predicted AI detection score.
                      </p>
                    </div>
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

export default Dashboard;

export { Dashboard }