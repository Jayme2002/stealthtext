import React from 'react';
import { LandingHeader } from '../components/LandingHeader';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ = () => {
  const [openSection, setOpenSection] = React.useState<number | null>(null);

  const faqs = [
    {
      question: "What is StealthText?",
      answer: "StealthText is an advanced AI text humanization tool that helps transform AI-generated content into natural, human-like text that can bypass AI detection systems and optimize for SEO while maintaining the original meaning and context."
    },
    {
      question: "How does the word limit work?",
      answer: "Your word limit refreshes monthly and is based on your subscription plan. Free users get 500 words per month, while paid plans offer higher limits. Unused words don't roll over to the next month."
    },
    {
      question: "How accurate is the AI detection bypass?",
      answer: "StealthText uses advanced algorithms to achieve high bypass rates. While no solution is 100% guaranteed, our system consistently achieves low AI detection scores across major detection platforms."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time through your account settings. You'll continue to have access to your plan's features until the end of your current billing period."
    },
    {
      question: "Is my content secure?",
      answer: "Yes, we take security seriously. Your content is processed securely and is never stored or shared. We use encryption for all data transmission and don't retain any processed text."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer refunds if you accidentally accidentally re-subscribe to a plan and have not used the service. Please contact us at contactstealthtext@gmail.com to request a refund."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for a free account to get started with 500 words per month. You can upgrade to a paid plan anytime to access higher word limits and advanced features."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-800">
      <LandingHeader />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about StealthText
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 overflow-hidden transition-all duration-200 hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenSection(openSection === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  {openSection === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                
                <div
                  className={`px-6 transition-all duration-200 ease-in-out ${
                    openSection === index ? 'pb-4 max-h-96' : 'max-h-0 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};