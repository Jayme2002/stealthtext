import React, { useState, createContext, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, User, LayoutDashboard, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

// Create context for sidebar state
export const SidebarContext = createContext<{
  collapsed: boolean;
  width: string;
}>({
  collapsed: false,
  width: '16rem' // 64px
});

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const width = sidebarCollapsed ? '5rem' : '16rem';

  return (
    <SidebarContext.Provider value={{ collapsed: sidebarCollapsed, width }}>
      <div className={`fixed top-0 left-0 h-screen ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-gray-200 z-50`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-6 h-6 flex-shrink-0" />
            <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>
              StealthText
            </span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 focus:outline-none"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4">
          {/* Dashboard group (no header) */}
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
              }
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Dashboard</span>
            </NavLink>
          </div>

          {/* Features group for Humanizer */}
          <div className="mt-4">
            <div className={`text-xs font-semibold text-gray-400 px-4 mb-2 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'}`}>Features</div>
            <div className="space-y-1">
              <NavLink
                to="/humanizer"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                }
              >
                <Brain className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Humanizer</span>
              </NavLink>
            </div>
          </div>

          {/* Settings group for Account and Pricing */}
          <div className="mt-4">
            <div className={`text-xs font-semibold text-gray-400 px-4 mb-2 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'}`}>Settings</div>
            <div className="space-y-1">
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                }
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Account</span>
              </NavLink>
              <NavLink
                to="/pricing"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                }
              >
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'}`}>Pricing</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>
    </SidebarContext.Provider>
  );
};

// Hook to access sidebar state
export const useSidebar = () => useContext(SidebarContext);