import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  isMobileView: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileView: (isMobile: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

// Initialize dark mode on store creation
document.documentElement.classList.add('dark');

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      isMobileView: false,
      darkMode: true,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileView: (isMobile) => set({ isMobileView: isMobile }),
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode;
        // Update document class for dark mode
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newDarkMode };
      }),
      setDarkMode: (enabled) => set(() => {
        // Update document class for dark mode
        if (enabled) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: enabled };
      }),
    }),
    {
      name: 'ui-store',
    }
  )
);