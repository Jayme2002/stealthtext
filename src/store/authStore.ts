import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: any | null;
  setUser: (user: any | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  signUp: async (email, password) => {
    // Add logging to see what's happening
    console.log('Signing up with email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      }
    });
    
    console.log('Signup response:', data);
    
    if (error) throw error;
    
    // Don't automatically set the user on signup
    // This will ensure they verify their email first
    
    // Return the data so we can check if email verification is required
    return data;
  },
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) throw error;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  checkEmailVerification: async () => {
    // Get the current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return false;
    }
    
    // Refresh the session to get the latest user data
    const { data: refreshData } = await supabase.auth.refreshSession();
    
    // Check if the email is confirmed
    return refreshData.session?.user?.email_confirmed_at != null;
  },
}));