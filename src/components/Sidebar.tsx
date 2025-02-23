import React, { createContext, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, User, LayoutDashboard, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const SidebarContext = createContext<{
  collapsed: boolean;
  width: string;
}>({
  collapsed: false,
  width: '16rem'
});

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const width = sidebarCollapsed ? '5rem' : '16rem';

  return (
    <SidebarContext.Provider value={{ collapsed: sidebarCollapsed, width }}>
      <div 
        className={`fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-gray-200 z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Toggle button positioned absolutely */}
        <button 
          onClick={toggleSidebar}
          className={`absolute top-4 transition-all duration-300 ease-in-out ${
            sidebarCollapsed 
              ? 'right-0 translate-x-1/2' 
              : 'right-2'
          } z-50 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50`}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="px-3 py-4">
          <div className="flex items-center px-3 py-2.5">
            <Brain className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              StealthText
            </span>
          </div>
        </div>
        
        <nav className="flex-1 px-3">
          {/* Dashboard group */}
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
              }
            >
              <LayoutDashboard className="w-6 h-6 flex-shrink-0" />
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                Dashboard
              </span>
            </NavLink>
          </div>

          {/* Features group */}
          <div className="mt-6">
            <div className={`text-xs font-semibold text-gray-400 px-3 mb-2 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              Features
            </div>
            <div className="space-y-1">
              <NavLink
                to="/humanizer"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                }
              >
                <Brain className="w-6 h-6 flex-shrink-0" />
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                  Humanizer
                </span>
              </NavLink>
            </div>
          </div>

          {/* Settings group */}
          <div className="mt-6">
            <div className={`text-xs font-semibold text-gray-400 px-3 mb-2 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              Settings
            </div>
            <div className="space-y-1">
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                }
              >
                <User className="w-6 h-6 flex-shrink-0" />
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                  Account
                </span>
              </NavLink>
              <NavLink
                to="/pricing"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                }
              >
                <CreditCard className="w-6 h-6 flex-shrink-0" />
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                  Pricing
                </span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);