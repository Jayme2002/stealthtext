import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import { Pricing } from './pages/Pricing';
import { Account } from './pages/Account';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { useSubscriptionStore } from './store/subscriptionStore';
import { Guide } from './pages/Guide';
import Humanizer from './pages/Humanizer';
import AIDetection from './pages/AIDetection';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import { EmailVerification } from './pages/EmailVerification';
import { UpdatePassword } from './pages/UpdatePassword';
import { useUIStore } from './store/uiStore';

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const darkMode = useUIStore(state => state.darkMode);
  const setDarkMode = useUIStore(state => state.setDarkMode);
  const { isMobileView, setMobileView } = useUIStore();

  // Initialize dark mode on app startup
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check for mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobileView);
  }, [setMobileView]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setUser(session?.user ?? null);
          }
        );
        
        return () => subscription.unsubscribe();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [setUser]);

  const fetchSubscription = useSubscriptionStore((state) => state.fetchSubscription);
  const setSubscription = useSubscriptionStore((state) => state.setSubscription);

  useEffect(() => {
    if (user) {
      const store = useSubscriptionStore.getState();
      
      // First initialize the user's usage metrics
      const initializeUsage = async () => {
        try {
          // Call the RPC function to ensure metrics exist
          await supabase.rpc('initialize_new_user_usage', { user_uuid: user.id });
          
          // Then fetch subscription and usage data
          await store.fetchSubscription();
          await store.fetchUsage(user.id);
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      };
      
      initializeUsage();
    } else {
      setSubscription(null);
    }
  }, [user, fetchSubscription, setSubscription]);

  useEffect(() => {
    if (!user) return;
    const subscriptionChannel = supabase.channel('subscriptions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subscriptions', 
        filter: `user_id=eq.${user.id}` 
      }, async () => {
        console.log('Detected subscription change');
        await fetchSubscription();
        await useSubscriptionStore.getState().fetchUsage(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [user, fetchSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-dark-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-dark-800 dark:text-white">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Setup Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please click the "Connect to Supabase" button in the top right to set up your Supabase project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
          <Helmet>
            <link rel="icon" href="/icons/noun-ninja.svg" />
            <meta name="theme-color" content={darkMode ? '#202123' : '#ffffff'} />
          </Helmet>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/humanizer" element={user ? <Humanizer /> : <Navigate to="/login" />} />
            <Route path="/aidetection" element={user ? <AIDetection /> : <Navigate to="/login" />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/guide" element={user ? <Guide /> : <Navigate to="/login" />} />
            <Route path="/account" element={user ? <Account /> : <Navigate to="/login" />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/update-password" element={<UpdatePassword />} />
          </Routes>
          <Footer />
          <MobileNav />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;