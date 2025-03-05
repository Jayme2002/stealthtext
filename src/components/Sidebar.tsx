import React, { createContext, useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, User, LayoutDashboard, CreditCard, ChevronLeft, ChevronRight, X, Menu } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const SidebarContext = createContext<{
  collapsed: boolean;
  width: string;
  isMobile: boolean;
}>({
  collapsed: false,
  width: '16rem',
  isMobile: false
});

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed, isMobileView, setMobileView } = useUIStore();
  // On mobile, width should be 0 regardless of collapsed state
  const width = isMobileView ? '0' : (sidebarCollapsed ? '5rem' : '16rem');

  // Check for mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      
      // Auto-collapse sidebar on mobile
      if (isMobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobileView);
  }, [setSidebarCollapsed, setMobileView, sidebarCollapsed]);

  // If mobile view, don't render the sidebar at all
  if (isMobileView) {
    return (
      <SidebarContext.Provider value={{ collapsed: true, width, isMobile: isMobileView }}>
        {/* Mobile sidebar drawer - only visible when toggled */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={() => setSidebarCollapsed(true)}
        />
        
        <div 
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <img 
                src="/icons/noun-ninja.svg"
                className="w-8 h-8"
                alt="StealthText Logo"
              />
              <span className="ml-3 font-medium">StealthText</span>
            </div>
            <button 
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="p-4">
            <div className="space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                }
                onClick={() => setSidebarCollapsed(true)}
              >
                <LayoutDashboard className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3">Dashboard</span>
              </NavLink>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-400 px-3 mb-2">
                Features
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/humanizer"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                  }
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <Brain className="w-6 h-6 flex-shrink-0" />
                  <span className="ml-3">Humanizer</span>
                </NavLink>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-400 px-3 mb-2">
                Settings
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                  }
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <User className="w-6 h-6 flex-shrink-0" />
                  <span className="ml-3">Account</span>
                </NavLink>
                <NavLink
                  to="/pricing"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                  }
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <CreditCard className="w-6 h-6 flex-shrink-0" />
                  <span className="ml-3">Pricing</span>
                </NavLink>
              </div>
            </div>
          </nav>
        </div>
      </SidebarContext.Provider>
    );
  }

  // Desktop sidebar
  return (
    <SidebarContext.Provider value={{ collapsed: sidebarCollapsed, width, isMobile: isMobileView }}>
      <div 
        className={`fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-gray-200 z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
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
            <img 
              src="/icons/noun-ninja.svg"
              className="w-8 h-8 flex-shrink-0 transition-all"
              alt="StealthText Logo"
            />
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
              onClick={() => isMobileView && setSidebarCollapsed(true)}
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
                onClick={() => isMobileView && setSidebarCollapsed(true)}
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
                onClick={() => isMobileView && setSidebarCollapsed(true)}
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
                onClick={() => isMobileView && setSidebarCollapsed(true)}
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