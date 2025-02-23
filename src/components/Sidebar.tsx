import React, { useState, createContext, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Shield, Settings, CreditCard, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';

// Create context for sidebar state
export const SidebarContext = createContext<{
  collapsed: boolean;
  width: string;
}>({
  collapsed: false,
  width: '16rem' // 64px
});

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? '5rem' : '16rem'; // 20px : 64px

  return (
    <SidebarContext.Provider value={{ collapsed, width }}>
      <div className={`fixed top-0 left-0 h-screen ${collapsed ? 'w-20' : 'w-64'} flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-gray-200 z-50`}>
        <div className="p-4 flex items-center justify-between">
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
        
        <nav className="flex-1 p-4">
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
    </SidebarContext.Provider>
  );
};

// Hook to access sidebar state
export const useSidebar = () => useContext(SidebarContext);