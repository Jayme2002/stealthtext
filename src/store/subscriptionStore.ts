import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at?: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription | null) => void;
  fetchSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  setSubscription: (subscription) => set({ subscription }),
  fetchSubscription: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ subscription: null });
        return;
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      set({ subscription });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      set({ subscription: null });
    }
  },
}));