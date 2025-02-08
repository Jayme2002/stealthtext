import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-8">
              Humanize AI Generated Content
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              StealthWriter is an SEO tool that converts AI generated content into human-like content. Get better content & get 100% human score.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-3 text-lg font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Try For Free
            </Link>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex gap-4 mb-4">
                <button className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100">ChatGPT</button>
                <button className="px-4 py-2 text-sm font-medium">Claude</button>
                <button className="px-4 py-2 text-sm font-medium">Llama</button>
                <button className="px-4 py-2 text-sm font-medium">Human</button>
              </div>
              
              <textarea
                className="w-full h-64 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Enter your text here..."
              />
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  0 characters | 0 words
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200">
                    Check for AI
                  </button>
                  <button className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
                    Humanize
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};