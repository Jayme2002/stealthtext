import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export const LandingHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img 
              src="src/icons/noun-ninja.svg" 
              className="w-8 h-8"
              alt="StealthText Logo"
            />
            <span className="font-bold text-xl">StealthText</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/humanizer"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Humanizer
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Pricing
            </Link>
            <a
              href="#faq"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium text-white bg-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};