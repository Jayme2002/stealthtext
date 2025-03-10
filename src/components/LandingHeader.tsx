import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const LandingHeader = () => {
  const darkMode = useUIStore((state) => state.darkMode);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-dark-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img 
              src="/icons/noun-ninja.svg"
              className={`w-8 h-8 ${darkMode ? 'invert' : ''}`}
              alt="NinjaText Logo"
            />
            <span className="font-bold text-xl dark:text-white">NinjaText</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/humanizer"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Humanizer
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/faq"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium text-white bg-black dark:bg-white dark:text-dark-800 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};