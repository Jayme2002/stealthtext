import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, User, LayoutDashboard, Menu, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

const MobileNav: React.FC = () => {
  const { isMobileView, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  
  if (!isMobileView) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: darkMode ? '#202123' : '#ffffff',
        borderTop: `1px solid ${darkMode ? '#3f3f46' : '#e5e7eb'}`,
        zIndex: 999, // Higher z-index to ensure it's on top
        height: '64px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <NavLink
        to="/dashboard"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20%',
          height: '100%',
          color: isActive 
            ? '#8b5cf6' // purple for active
            : darkMode ? '#9ca3af' : '#6b7280',
          textDecoration: 'none'
        })}
      >
        <LayoutDashboard size={20} />
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Dashboard</span>
      </NavLink>
      
      <NavLink
        to="/humanizer"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20%',
          height: '100%',
          color: isActive 
            ? '#8b5cf6' // purple for active
            : darkMode ? '#9ca3af' : '#6b7280',
          textDecoration: 'none'
        })}
      >
        <Brain size={20} />
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Humanizer</span>
      </NavLink>
      
      <button
        onClick={toggleSidebar}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20%',
          height: '100%',
          background: 'none',
          border: 'none',
          color: darkMode ? '#9ca3af' : '#6b7280',
          padding: 0
        }}
      >
        <Menu size={20} />
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Menu</span>
      </button>
      
      <NavLink
        to="/account"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20%',
          height: '100%',
          color: isActive 
            ? '#8b5cf6' // purple for active
            : darkMode ? '#9ca3af' : '#6b7280',
          textDecoration: 'none'
        })}
      >
        <User size={20} />
        <span style={{ fontSize: '12px', marginTop: '4px' }}>Account</span>
      </NavLink>
      
      <button
        onClick={toggleDarkMode}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20%',
          height: '100%',
          background: 'none',
          border: 'none',
          color: darkMode ? '#9ca3af' : '#6b7280',
          padding: 0
        }}
      >
        {darkMode ? (
          <>
            <Sun size={20} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Light</span>
          </>
        ) : (
          <>
            <Moon size={20} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Dark</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MobileNav;