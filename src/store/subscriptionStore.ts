import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription | null) => void;
  fetchSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState, [['zustand/persist', SubscriptionState]]>(
  persist(
    (set) => ({
      subscription: null,
      setSubscription: (subscription) => set({ subscription }),
      fetchSubscription: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session || !session.user) {
            set({ subscription: null });
            return;
          }

          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching subscription:', error);
            throw error;
          }

          // Only set active subscription if it has required fields
          if (subscription && subscription.plan && subscription.status) {
            set({ subscription });
          } else {
            set({ subscription: null });
          }
        } catch (error) {
          console.error('Error fetching subscription:', error);
          set({ subscription: null });
        }
      },
    }),
    { name: 'subscription-store' }
  )
);