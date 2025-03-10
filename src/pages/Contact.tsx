import React from 'react';
import { LandingHeader } from '../components/LandingHeader';
import { Mail } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-800">
      <LandingHeader />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
          </div>

          <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 dark:bg-dark-700 rounded-lg shadow-sm">
            <Mail className="w-10 h-10 text-purple-500 mb-4" />
            <p className="text-xl text-center text-gray-800 dark:text-gray-200 font-medium">
              Please email <a href="mailto:contactninjatext@gmail.com" className="text-purple-600 dark:text-purple-400 hover:underline">contactstealthtext@gmail.com</a> for any inquiries.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};