import React from 'react';
import { LandingHeader } from '../components/LandingHeader';
import { Shield } from 'lucide-react';

export const Terms = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Last updated: February 10, 2025
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using StealthText ("the Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              StealthText provides AI text humanization services. The Service processes AI-generated content to make it more natural and human-like while maintaining the original meaning.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the Service, you must register for an account. You agree to provide accurate information and maintain the security of your account credentials.
            </p>

            <h2>4. Subscription and Payments</h2>
            <p>
              Paid subscriptions are billed in advance on a monthly basis. You may cancel your subscription at any time, but no refunds will be provided for partial months of service.
            </p>

            <h2>5. Usage Restrictions</h2>
            <p>
              You agree not to use the Service for any unlawful purposes or to violate any rights of third parties, including intellectual property rights.
            </p>

            <h2>6. Content Ownership</h2>
            <p>
              You retain all rights to your content. By using the Service, you grant us a license to process and modify your content solely for the purpose of providing the Service.
            </p>

            <h2>7. Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at support@stealthtext.ai.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};