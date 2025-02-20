import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { PLANS } from '../lib/stripe';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

interface UsageMetrics {
  used_chars: number;
  allocated_chars: number;
}

interface SubscriptionState {
  subscription: Subscription | null;
  usage: UsageMetrics | null;
  setSubscription: (subscription: Subscription | null) => void;
  fetchSubscription: () => Promise<void>;
  fetchUsage: (userId: string) => Promise<void>;
  checkUsage: (userId: string, charsNeeded: number) => Promise<{ canProceed: boolean; error?: any }>;
}

export const useSubscriptionStore = create<SubscriptionState, [['zustand/persist', SubscriptionState]]>(
  persist(
    (set, get) => ({
      subscription: null,
      usage: null,
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
            .select('id, plan, status, current_period_end, cancel_at, stripe_subscription_id, stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching subscription:', error);
            throw error;
          }

          // Only set subscription if it has required fields, and normalize plan to lowercase
          if (subscription && subscription.plan && subscription.status) {
            subscription.plan = subscription.plan.toLowerCase();
            set({ subscription });
          } else {
            set({ subscription: null });
          }
        } catch (error) {
          console.error('Error fetching subscription:', error);
          set({ subscription: null });
        }
      },
      fetchUsage: async (userId) => {
        const { data, error } = await supabase
          .rpc('get_usage_metrics', { user_uuid: userId })
          .returns<UsageMetrics>()
          .single();

        if (!error && data) {
          const usageData = data as UsageMetrics;
          const currentSubscription = get().subscription;
          let allocated_chars = usageData.allocated_chars;
          if (currentSubscription && currentSubscription.plan) {
            const planKey = currentSubscription.plan.toLowerCase() as 'free' | 'premium' | 'premium+' | 'pro';
            if (PLANS[planKey]) {
              allocated_chars = PLANS[planKey].monthly_characters;
            }
          }
          set({ usage: { used_chars: usageData.used_chars, allocated_chars } });
        }
      },
      checkUsage: async (userId, charsNeeded) => {
        const { data, error } = await supabase
          .rpc('check_and_update_usage', {
            user_uuid: userId,
            chars_used: charsNeeded
          })
          // Add auth selector for proper RLS handling
          .select('*')
          .single();
        
        return { 
          canProceed: data ? Boolean(data) : false,
          error
        };
      }
    }),
    { name: 'subscription-store' }
  )
);