import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Star, Zap, User } from 'lucide-react';
import { PLANS, createCheckoutSession } from '../lib/stripe';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';

const MobilePricing: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Set CSS variables for styling
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--bg-color', isDark ? '#202123' : '#f9fafb');
    document.documentElement.style.setProperty('--card-bg', isDark ? '#2d2d30' : '#ffffff');
    document.documentElement.style.setProperty('--text-primary', isDark ? '#ffffff' : '#111827');
    document.documentElement.style.setProperty('--text-secondary', isDark ? '#9ca3af' : '#4b5563');
    document.documentElement.style.setProperty('--border-color', isDark ? '#3f3f46' : '#e5e7eb');
    document.documentElement.style.setProperty('--highlight-color', '#8b5cf6');
  }, []);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(priceId);
    setError(null);
    
    try {
      await createCheckoutSession(priceId);
      const store = useSubscriptionStore.getState();
      await store.fetchSubscription();
      await store.fetchUsage(user.id);
    } catch (error) {
      console.error('Subscription Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start subscription process');
    } finally {
      setIsLoading(null);
    }
  };

  const getCurrentPlanKey = () => {
    return subscription ? subscription.plan : null;
  };

  const currentPlanKey = getCurrentPlanKey();

  const getPlanIcon = (key: string, size: number = 24) => {
    switch (key) {
      case 'free': 
        return <User size={size} color="var(--text-secondary)" />;
      case 'premium': 
        return <Crown size={size} color="#a855f7" />;
      case 'premium+': 
        return <Star size={size} color="#eab308" />;
      case 'pro': 
        return <Zap size={size} color="#3b82f6" />;
      default: 
        return null;
    }
  };

  const getPlanGradient = (key: string) => {
    switch (key) {
      case 'premium': 
        return 'linear-gradient(135deg, #8b5cf6, #ec4899)';
      case 'premium+': 
        return 'linear-gradient(135deg, #fbbf24, #f97316)';
      case 'pro': 
        return 'linear-gradient(135deg, #3b82f6, #6366f1)';
      default: 
        return 'none';
    }
  };

  const styles = {
    container: {
      padding: '16px 16px 80px 16px',
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden' as 'hidden'
    },
    header: {
      textAlign: 'center' as 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '1rem',
      color: 'var(--text-secondary)',
      marginBottom: '16px'
    },
    errorMessage: {
      padding: '12px',
      marginBottom: '16px',
      borderRadius: '8px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      fontSize: '0.875rem'
    },
    planCard: (key: string, isCurrentPlan: boolean) => ({
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: isCurrentPlan ? `2px solid var(--highlight-color)` : '1px solid var(--border-color)',
      marginBottom: '20px',
      overflow: 'hidden' as 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'relative' as 'relative'
    }),
    popularBadge: {
      position: 'absolute' as 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '4px 12px',
      borderRadius: '999px'
    },
    darkPopularBadge: {
      position: 'absolute' as 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#ffffff',
      color: '#111827',
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '4px 12px',
      borderRadius: '999px'
    },
    planHeader: {
      padding: '16px',
      display: 'flex' as 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    planTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      margin: 0
    },
    priceContainer: (key: string) => ({
      padding: '16px',
      background: getPlanGradient(key),
      color: key === 'free' ? 'var(--text-primary)' : 'white',
      textAlign: 'center' as 'center'
    }),
    price: {
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: 0
    },
    pricePeriod: {
      fontSize: '0.875rem',
      opacity: 0.9,
      marginTop: '4px'
    },
    featuresList: {
      listStyle: 'none',
      padding: '16px',
      margin: 0
    },
    featureItem: {
      display: 'flex' as 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '12px',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)'
    },
    featureIcon: {
      color: '#10b981',
      flexShrink: 0
    },
    actionContainer: {
      padding: '16px',
      borderTop: '1px solid var(--border-color)'
    },
    button: (isCurrentPlan: boolean, isLoading: boolean) => ({
      width: '100%',
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: isCurrentPlan ? 'var(--bg-color)' : '#000000',
      color: isCurrentPlan ? 'var(--text-primary)' : 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.7 : 1,
      textAlign: 'center' as 'center'
    }),
    darkButton: (isCurrentPlan: boolean, isLoading: boolean) => ({
      width: '100%',
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: isCurrentPlan ? 'var(--bg-color)' : '#ffffff',
      color: isCurrentPlan ? 'var(--text-primary)' : '#111827',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.7 : 1,
      textAlign: 'center' as 'center'
    })
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Choose your word limit</h1>
        <p style={styles.subtitle}>Scale your content humanization with our flexible plans</p>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {Object.entries(PLANS).map(([key, plan]) => {
        const isCurrentPlan = currentPlanKey === key;
        
        return (
          <div key={key} style={styles.planCard(key, isCurrentPlan)}>
            {key === 'premium+' && (
              <div style={isDarkMode ? styles.darkPopularBadge : styles.popularBadge}>
                Most Popular
              </div>
            )}
            <div style={styles.planHeader}>
              {getPlanIcon(key)}
              <h2 style={styles.planTitle}>{plan.name}</h2>
            </div>
            
            <div style={styles.priceContainer(key)}>
              <p style={styles.price}>${plan.price}</p>
              <p style={styles.pricePeriod}>per month</p>
            </div>
            
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>
                <Check size={16} style={styles.featureIcon} />
                <span>
                  {key === 'free' ? '250 words per month' : 
                  key === 'premium' ? '10,000 words per month' : 
                  key === 'premium+' ? '25,000 words per month' : 
                  '50,000 words per month'}
                </span>
              </li>
              <li style={styles.featureItem}>
                <Check size={16} style={styles.featureIcon} />
                <span>
                  {key === 'free' ? 'Up to 250 words per request' : 
                  key === 'premium' ? 'Up to 500 words per request' : 
                  key === 'premium+' ? 'Up to 1,000 words per request' : 
                  'Up to 2,000 words per request'}
                </span>
              </li>
            </ul>
            
            <div style={styles.actionContainer}>
              {isCurrentPlan ? (
                <div style={isDarkMode ? styles.darkButton(true, false) : styles.button(true, false)}>
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  disabled={isLoading === plan.priceId || !plan.priceId}
                  style={isDarkMode ? styles.darkButton(false, isLoading === plan.priceId) : styles.button(false, isLoading === plan.priceId)}
                >
                  {isLoading === plan.priceId
                    ? 'Processing...'
                    : plan.price === 0
                    ? 'Get Started'
                    : 'Subscribe'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobilePricing;