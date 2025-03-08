import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Shield, Clock, Sparkles, Crown, Star, User } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';

const MobileDashboard: React.FC = () => {
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);

  const getPlanIcon = () => {
    if (!subscription || subscription.plan === 'free') {
      return <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
    switch (subscription.plan) {
      case 'premium':
        return <Crown className="w-5 h-5 text-white" />;
      case 'premium+':
        return <Star className="w-5 h-5 text-white" />;
      case 'pro':
        return <Zap className="w-5 h-5 text-white" />;
      default:
        return <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getPlanGradient = () => {
    if (!subscription || subscription.plan === 'free') {
      return 'bg-gray-100 text-gray-900 dark:bg-dark-700 dark:text-gray-100';
    }
    switch (subscription.plan) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'premium+':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'pro':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      default:
        return 'bg-gray-100 text-gray-900 dark:bg-dark-700 dark:text-gray-100';
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      title: "Advanced AI Detection",
      description: "Our AI detection system analyzes text patterns to ensure your content appears natural and human-written."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Fast Processing",
      description: "Get results in seconds with our optimized processing engine."
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Content Protection",
      description: "Your content is processed securely and never stored or shared."
    },
    {
      icon: <Clock className="w-6 h-6 text-green-500" />,
      title: "24/7 Availability",
      description: "Access our humanizer service anytime, anywhere."
    }
  ];

  const mobileStyles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      padding: '16px 16px 80px 16px', // Extra bottom padding for mobile nav
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '16px',
      width: '100%',
      position: 'relative' as 'relative',
      overflowX: 'hidden' as 'hidden'
    },
    card: {
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: 'var(--card-bg)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid var(--border-color)',
      marginBottom: '16px',
      width: '100%'
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      marginBottom: '8px'
    },
    subHeading: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '12px'
    },
    paragraph: {
      fontSize: '0.9rem',
      color: 'var(--text-secondary)',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'var(--button-bg)',
      color: 'var(--button-text)',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '0.875rem',
      border: 'none',
      cursor: 'pointer'
    },
    progressContainer: {
      width: '100%',
      backgroundColor: 'var(--progress-bg)',
      borderRadius: '4px',
      height: '8px',
      marginTop: '8px',
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    statsCard: {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '16px'
    },
    featureTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '4px'
    },
    featureDesc: {
      fontSize: '0.8rem',
      color: 'var(--text-secondary)',
      lineHeight: '1.4'
    }
  };

  // Dynamically set CSS variables based on theme
  document.documentElement.style.setProperty('--bg-color', document.documentElement.classList.contains('dark') ? '#202123' : '#f9fafb');
  document.documentElement.style.setProperty('--card-bg', document.documentElement.classList.contains('dark') ? '#2d2d30' : '#ffffff');
  document.documentElement.style.setProperty('--text-primary', document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827');
  document.documentElement.style.setProperty('--text-secondary', document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563');
  document.documentElement.style.setProperty('--border-color', document.documentElement.classList.contains('dark') ? '#3f3f46' : '#e5e7eb');
  document.documentElement.style.setProperty('--button-bg', 'linear-gradient(90deg, #8b5cf6, #ec4899)');
  document.documentElement.style.setProperty('--button-text', '#ffffff');
  document.documentElement.style.setProperty('--progress-bg', document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb');

  return (
    <div style={mobileStyles.pageContainer}>
      {/* Welcome Section */}
      <div style={mobileStyles.card}>
        <h1 style={mobileStyles.heading}>Welcome to StealthText</h1>
        <p style={mobileStyles.paragraph}>
          Transform your AI-generated content into natural, human-like text that bypasses AI detection.
        </p>
        <Link 
          to="/humanizer"
          style={{
            ...mobileStyles.button,
            background: 'var(--button-bg)'
          }}
        >
          <Sparkles size={16} />
          Start Humanizing
        </Link>
      </div>

      {/* Usage Statistics */}
      <div style={mobileStyles.card}>
        <h2 style={mobileStyles.subHeading}>Usage Statistics</h2>
        <div>
          {/* Words Used */}
          <div style={{
            ...mobileStyles.statsCard,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6'
          }}>
            <p style={{
              fontSize: '0.8rem',
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
            }}>
              Words Used
            </p>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827'
            }}>
              {usage?.used_words || 0} / {usage?.allocated_words || 0}
            </p>
            <div style={mobileStyles.progressContainer}>
              <div 
                style={{
                  ...mobileStyles.progressBar,
                  width: `${Math.min(((usage?.used_words || 0) / (usage?.allocated_words || 1)) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                }}
              />
            </div>
          </div>

          {/* Current Plan */}
          <div style={{
            ...mobileStyles.statsCard,
            background: subscription?.plan === 'free' 
              ? (document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6')
              : subscription?.plan === 'premium'
                ? 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                : subscription?.plan === 'premium+'
                  ? 'linear-gradient(90deg, #fbbf24, #f97316)'
                  : 'linear-gradient(90deg, #3b82f6, #6366f1)',
            color: subscription?.plan === 'free'
              ? 'inherit'
              : '#ffffff',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getPlanIcon()}
              <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Current Plan</p>
            </div>
            <p style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginTop: '4px',
              color: subscription?.plan === 'free' 
                ? (document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827')
                : '#ffffff'
            }}>
              {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1) || 'Free'}
            </p>
            {subscription?.plan === 'free' && (
              <Link
                to="/pricing"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                  color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginTop: '8px'
                }}
              >
                <Crown size={14} />
                Upgrade Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={mobileStyles.card}>
        <h2 style={mobileStyles.subHeading}>Features</h2>
        {features.map((feature, index) => (
          <div key={index} style={mobileStyles.featureItem}>
            <div>
              {feature.icon}
            </div>
            <div>
              <h3 style={mobileStyles.featureTitle}>{feature.title}</h3>
              <p style={mobileStyles.featureDesc}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileDashboard;