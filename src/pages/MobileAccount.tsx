import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Loader2, Crown, Star, Zap, User, Clock, LogOut } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getPlanName } from '../utils/subscriptionPlanMapping';
import { supabase } from '../lib/supabase';
import { PLANS } from '../lib/stripe';
import { useAuthStore } from '../store/authStore';

const MobileAccount: React.FC = () => {
  const subscription = useSubscriptionStore((state) => state.subscription);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const signOut = useAuthStore((state) => state.signOut);

  // Set CSS variables for styling
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--bg-color', isDark ? '#202123' : '#f9fafb');
    document.documentElement.style.setProperty('--card-bg', isDark ? '#2d2d30' : '#ffffff');
    document.documentElement.style.setProperty('--text-primary', isDark ? '#ffffff' : '#111827');
    document.documentElement.style.setProperty('--text-secondary', isDark ? '#9ca3af' : '#4b5563');
    document.documentElement.style.setProperty('--border-color', isDark ? '#3f3f46' : '#e5e7eb');
    document.documentElement.style.setProperty('--button-primary', 'linear-gradient(90deg, #8b5cf6, #ec4899)');
    document.documentElement.style.setProperty('--button-secondary', isDark ? '#374151' : '#f3f4f6');
  }, []);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No active session found. Please log in.");
        setIsLoading(false);
        return;
      }
      
      const token = session.access_token;
      
      // Simple retry logic
      let retryAttempts = 0;
      const maxRetries = 2;
      let response;
      
      while (retryAttempts <= maxRetries) {
        try {
          response = await fetch('https://qbdzfdqnnhdprwvdnlkn.supabase.co/functions/v1/create-portal-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include'
          });
          break;
        } catch (error) {
          retryAttempts++;
          if (retryAttempts > maxRetries) throw error;
          console.log(`Retrying portal session request, attempt ${retryAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!response) {
        throw new Error('Failed to make API request after retries');
      }

      // Better error handling
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open subscription portal');
      }

      if (!data.url) {
        throw new Error('No portal URL received');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to open subscription management');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to log out');
    }
  };

  const getPlanIcon = () => {
    if (!subscription || subscription.plan === 'free') {
      return <User size={20} color="var(--text-secondary)" />;
    }
    switch (subscription.plan) {
      case 'premium':
        return <Crown size={20} color="#a855f7" />;
      case 'premium+':
        return <Star size={20} color="#eab308" />;
      case 'pro':
        return <Zap size={20} color="#3b82f6" />;
      default:
        return <User size={20} color="var(--text-secondary)" />;
    }
  };

  const getPlanBackground = () => {
    if (!subscription || subscription.plan === 'free') {
      return 'var(--button-secondary)';
    }
    switch (subscription.plan) {
      case 'premium':
        return 'linear-gradient(90deg, #8b5cf6, #ec4899)';
      case 'premium+':
        return 'linear-gradient(90deg, #fbbf24, #f97316)';
      case 'pro':
        return 'linear-gradient(90deg, #3b82f6, #6366f1)';
      default:
        return 'var(--button-secondary)';
    }
  };

  const currentPlan = subscription ? getPlanName(subscription.plan) : 'Free';
  const hasActiveSubscription = subscription?.status === 'active' && subscription.plan !== 'free' && !subscription?.cancel_at;
  const planDetails = PLANS[subscription?.plan || 'free'];

  // Mobile styles
  const styles = {
    container: {
      padding: '16px 16px 80px 16px',
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden' as 'hidden'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      lineHeight: '1.5'
    },
    card: {
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      marginBottom: '24px',
      overflow: 'hidden' as 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    cardHeader: {
      padding: '16px',
      borderBottom: '1px solid var(--border-color)'
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '0'
    },
    cardContent: {
      padding: '16px'
    },
    planCard: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px',
      color: (!subscription || subscription.plan === 'free') ? 'var(--text-primary)' : 'white',
    },
    planHeader: {
      display: 'flex' as 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    planTitle: {
      display: 'flex' as 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    planName: {
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    planFeature: {
      fontSize: '0.875rem',
      opacity: '0.9'
    },
    statusBadge: {
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '4px 8px',
      borderRadius: '999px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    },
    buttonContainer: {
      borderTop: '1px solid var(--border-color)',
      padding: '16px',
      marginTop: '16px'
    },
    button: (primary: boolean) => ({
      display: 'inline-flex' as 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      justifyContent: 'center',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      backgroundColor: primary ? 'black' : 'var(--button-secondary)',
      color: primary ? 'white' : 'var(--text-primary)',
      border: 'none',
      cursor: 'pointer'
    }),
    darkModeButton: (primary: boolean) => ({
      display: 'inline-flex' as 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      justifyContent: 'center',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      backgroundColor: primary ? 'white' : 'var(--button-secondary)',
      color: primary ? '#111827' : 'var(--text-primary)',
      border: 'none',
      cursor: 'pointer'
    }),
    logoutButton: {
      display: 'inline-flex' as 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      justifyContent: 'center',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      border: 'none',
      cursor: 'pointer',
      marginTop: '16px'
    },
    billingInfo: {
      display: 'flex' as 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)'
    },
    errorMessage: {
      padding: '12px',
      marginBottom: '16px',
      borderRadius: '8px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      fontSize: '0.875rem'
    }
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Account Settings</h1>
        <p style={styles.subtitle}>Manage your subscription and account preferences</p>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Current Plan</h2>
        </div>
        <div style={styles.cardContent}>
          <div 
            style={{
              ...styles.planCard,
              background: getPlanBackground()
            }}
          >
            <div style={styles.planHeader}>
              <div style={styles.planTitle}>
                {getPlanIcon()}
                <div>
                  <h3 style={styles.planName}>{currentPlan}</h3>
                  <p style={styles.planFeature}>
                    {planDetails.monthly_words.toLocaleString()} words per month
                  </p>
                </div>
              </div>
              {hasActiveSubscription ? (
                <div style={styles.statusBadge}>
                  Active
                </div>
              ) : subscription?.cancel_at && (
                <div style={styles.statusBadge}>
                  Cancels {new Date(subscription.cancel_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div style={styles.buttonContainer}>
            {hasActiveSubscription ? (
              <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                style={isDarkMode ? styles.darkModeButton(true) : styles.button(true)}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Manage Subscription
                  </>
                )}
              </button>
            ) : (
              <Link
                to="/pricing"
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  width: '100%'
                }}
              >
                <div style={isDarkMode ? styles.darkModeButton(true) : styles.button(true)}>
                  Upgrade Plan
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {hasActiveSubscription && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Billing History</h2>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.billingInfo}>
              <Clock size={16} />
              <span>Next billing date: {subscription.current_period_end && 
                new Date(subscription.current_period_end).toLocaleDateString()
              }</span>
            </div>
          </div>
        </div>
      )}

      {/* Logout Section */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Account</h2>
        </div>
        <div style={styles.cardContent}>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAccount;