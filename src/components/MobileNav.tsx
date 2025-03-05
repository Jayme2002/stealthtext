import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, User, LayoutDashboard, CreditCard, Menu } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

const MobileNav: React.FC = () => {
  const { isMobileView, toggleSidebar } = useUIStore();
  
  if (!isMobileView) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-purple-600' : 'text-gray-500'}`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/humanizer"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-purple-600' : 'text-gray-500'}`
          }
        >
          <Brain className="w-5 h-5" />
          <span className="text-xs mt-1">Humanizer</span>
        </NavLink>
        
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs mt-1">Menu</span>
        </button>
        
        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-purple-600' : 'text-gray-500'}`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Account</span>
        </NavLink>
        
        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-purple-600' : 'text-gray-500'}`
          }
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-xs mt-1">Pricing</span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileNav; 