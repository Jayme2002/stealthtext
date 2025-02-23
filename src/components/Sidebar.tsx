import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Shield, Settings, CreditCard, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`fixed top-0 left-0 h-screen z-40 bg-transparent ${collapsed ? 'w-20' : 'w-64'} flex flex-col transition-all duration-300 ease-in-out`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-transparent">
        <div className="flex items-center">
          <Brain className="w-6 h-6 flex-shrink-0" />
          <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>
            StealthText
          </span>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 focus:outline-none">
          {collapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 bg-transparent">
        <div className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
            }
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Dashboard</span>
          </NavLink>

          <NavLink
            to="/humanizer"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
            }
          >
            <Brain className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Humanizer</span>
          </NavLink>
          
          <NavLink
            to="/ai-detector"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
            }
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>AI Detector</span>
          </NavLink>
        </div>

        <div className="mt-8">
          <div className={`text-xs font-semibold text-gray-400 px-4 mb-2 transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'}`}>
            Settings
          </div>
          <div className="space-y-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
              }
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Settings</span>
            </NavLink>
            
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
              }
            >
              <CreditCard className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Pricing</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};