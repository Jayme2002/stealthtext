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
  used_words: number;
  allocated_chars: number;
  allocated_words: number;
}

interface SubscriptionState {
  subscription: Subscription | null;
  usage: UsageMetrics | null;
  setSubscription: (subscription: Subscription | null) => void;
  fetchSubscription: () => Promise<void>;
  fetchUsage: (userId: string) => Promise<void>;
  checkUsage: (userId: string, charsNeeded: number, wordsNeeded: number) => Promise<{ canProceed: boolean; error?: any }>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
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
          .from('usage_metrics')
          .select('used_chars, used_words, allocated_chars, allocated_words')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          set({ 
            usage: {
              used_chars: data.used_chars,
              used_words: data.used_words,
              allocated_chars: data.allocated_chars,
              allocated_words: data.allocated_words
            }
          });
        }
      },
      checkUsage: async (userId, charsNeeded, wordsNeeded) => {
        console.log('Checking usage for:', userId);
        console.log('Chars needed:', charsNeeded);
        console.log('Words needed:', wordsNeeded);

        const { data, error } = await supabase
          .rpc('check_and_update_usage', {
            user_uuid: userId,
            chars_used: charsNeeded,
            words_used: wordsNeeded
          })
          .single();

        console.log('RPC Response:', { data, error });
        
        if (!error) {
          await get().fetchUsage(userId);
        }
        
        return { 
          canProceed: data ? Boolean(data) : false,
          error
        };
      }
    }),
    {
      name: 'subscription-store',
      partialize: (state) => ({
        subscription: state.subscription,
        usage: state.usage
      })
    }
  )
);