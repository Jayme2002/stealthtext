import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, User, LayoutDashboard, CreditCard, Menu, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

const MobileNav: React.FC = () => {
  const { isMobileView, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  
  if (!isMobileView) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 z-30 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/humanizer"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`
          }
        >
          <Brain className="w-5 h-5" />
          <span className="text-xs mt-1">Humanizer</span>
        </NavLink>
        
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs mt-1">Menu</span>
        </button>
        
        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Account</span>
        </NavLink>
        
        <button
          onClick={toggleDarkMode}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400"
        >
          {darkMode ? (
            <>
              <Sun className="w-5 h-5" />
              <span className="text-xs mt-1">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              <span className="text-xs mt-1">Dark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileNav;