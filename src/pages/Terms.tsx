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
              Last updated: March 9, 2025
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Welcome to NinjaText! These terms and conditions outline the rules and regulations for the use of our software and website, located at https://ninjatext.app
            </p>
            <p>
              By accessing this website and using our services, we assume you accept these terms and conditions in full. If you do not agree with any part of these terms, you are prohibited from using the services.
            </p>

            <h2>1. Introduction</h2>
            <p>
              NinjaText, operated by [Your Company Name] ("Company," "we," "us," "our"), is registered in Victoria, British Columbia, Canada. The term "Services" refers to all the functionalities provided by NinjaText through its website and any related services.
            </p>

            <h2>2. User Eligibility</h2>
            <p>
              The Services are intended for individuals who are at least 18 years old. By using our Services, you represent that you meet this age requirement.
            </p>

            <h2>3. Modifications to Terms</h2>
            <p>
              We reserve the right to change, modify, or revise these terms at any time. The date of the latest revision will be indicated at the top of this page. Continued use of the Services following any changes indicates acceptance of the new terms.
            </p>

            <h2>4. Intellectual Property</h2>
            <p>
              All intellectual property rights in the Services, including our software, website design, graphics, and other materials, are owned by or licensed to us. You are granted a limited, non-exclusive, non-transferable, revocable license to access the Services for personal, non-commercial use only.
            </p>

            <h2>5. User Responsibilities and Conduct</h2>
            <p>
              You agree not to use the Services for any unlawful purpose and to comply with all applicable regulations. You may not engage in activities that could harm the Services' integrity or security, mislead us or other users, or engage in any form of data mining or extraction. You may not use the service to aid in any kind of academic integrity violation. The service is to be used for personal use only. You may not create multiple accounts to bypass the service's features.
            </p>

            <h2>6. User Content</h2>
            <p>
              By submitting any content (feedback, suggestions, ideas) to us, you grant NinjaText a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute such content. You are responsible for content shared via the Services and assume liability for any resulting damage or loss.
            </p>

            <h2>7. Privacy Policy</h2>
            <p>
              We are committed to protecting your privacy. Please refer to our Privacy Policy at [https://ninjatext.app/privacy] for information on how we collect, use, and disclose personal data.
            </p>

            <h2>8. Registration</h2>
            <p>
              You may be required to create an account to use certain features of the Services. It is your responsibility to maintain the confidentiality of your account details. NinjaText reserves the right to terminate or suspend access to your account in cases of violations of these terms or at its our own discretion.
            </p>

            <h2>9. Payment and Fees</h2>
            <p>
              Users who subscribe to our paid services agree to provide accurate payment details and pay all fees associated with the Services. Pricing and billing information are available on the website, and payment is processed in the currency specified on our platform.
            </p>

            <h2>10. Subscription and Cancellation</h2>
            <p>
              Subscriptions will renew automatically unless canceled. You may cancel your subscription via your account settings. There are no refunds of any kind. Changes in subscription fees will be communicated in advance in accordance with applicable law.
            </p>

            <h2>11. Disclaimers and Limitation of Liability</h2>
            <p>
              The Services are provided "as is," with no warranties of any kind. NinjaText does not guarantee the accuracy, completeness, or availability of the Services and will not be liable for any damages arising from use or inability to use the Services. NinjaText is not liable for any security breaches or data leaks. The service is not liable for any unlawful use of the service. The service is not liable for any technical outtages that may last indifinitely. The service is not liable for any harm caused by hacking or data leaks.
            </p>

            <h2>12. Dispute Resolution</h2>
            <p>
              Any disputes arising under these terms shall be governed by the laws of the Province of British Columbia, Canada. Parties agree to resolve disputes through binding arbitration or as otherwise provided by law.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              For any questions, complaints, or further information, please contact us at:
            </p>
            <p>
              - Email: support@ninjatext.app
            </p>
            <p>
              By using NinjaText, you acknowledge that you have read, understood, and agree to the terms and conditions outlined in this document.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};