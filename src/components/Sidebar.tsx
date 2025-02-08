import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Shield, Settings, CreditCard, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Sidebar = () => {
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <span className="font-semibold text-xl">StealthWriter</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg ${
                isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`
            }
          >
            <Brain className="w-5 h-5" />
            <span>Humanizer</span>
          </NavLink>
          
          <NavLink
            to="/ai-detector"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg ${
                isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            <span>AI Detector</span>
          </NavLink>
        </div>

        <div className="mt-8">
          <div className="text-xs font-semibold text-gray-400 px-4 mb-2">
            Settings
          </div>
          <div className="space-y-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
            
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`
              }
            >
              <CreditCard className="w-5 h-5" />
              <span>Pricing</span>
            </NavLink>
            
            <NavLink
              to="/account"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span>Account</span>
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 w-full rounded-lg hover:bg-gray-50"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};