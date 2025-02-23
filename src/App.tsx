import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import { Pricing } from './pages/Pricing';
import { Account } from './pages/Account';
import { useSubscriptionStore } from './store/subscriptionStore';
import Humanizer from './pages/Humanizer';
import Footer from './components/Footer';

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      fetchSubscription();
    } else {
      setSubscription(null);
    }
  }, [user, fetchSubscription, setSubscription]);

  // NEW: Subscribe to realtime updates for the user's subscription
  useEffect(() => {
    if (!user) return;
    const subscriptionChannel = supabase.channel('subscriptions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` }, payload => {
        console.log('Detected subscription change:', payload);
        fetchSubscription();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [user, fetchSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h2>
          <p className="text-gray-600 mb-6">
            Please click the "Connect to Supabase" button in the top right to set up your Supabase project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/reset-password"
            element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/humanizer"
            element={user ? <Humanizer /> : <Navigate to="/login" />}
          />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/account"
            element={user ? <Account /> : <Navigate to="/login" />}
          />
        </Routes>
        <Footer />
      </>
    </BrowserRouter>
  );
}

export default App;