import React from 'react';
import { LandingHeader } from '../components/LandingHeader';
import { Lock } from 'lucide-react';

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Lock className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Last updated: February 10, 2025
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy explains how StealthText ("we", "us", "our") collects, uses, and protects your personal information when you use our service.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Account information (email, password)</li>
              <li>Payment information</li>
              <li>Usage data</li>
              <li>Content you submit for processing</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul>
              <li>Provide and maintain our service</li>
              <li>Process your payments</li>
              <li>Send you service updates</li>
              <li>Improve our service</li>
              <li>Respond to your requests</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. Your content is processed securely and is not stored after processing.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to provide you with our service and as required by law.
            </p>

            <h2>6. Third-Party Services</h2>
            <p>
              We use trusted third-party services for:
            </p>
            <ul>
              <li>Payment processing</li>
              <li>Analytics</li>
              <li>Email communication</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
            </ul>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@stealthtext.ai.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};