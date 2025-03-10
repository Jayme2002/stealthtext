import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Copy, Loader2, Check, AlertCircle, Sparkles, FileText, Bot, User, Sliders, X } from 'lucide-react';
import { humanizeText, HumanizerIntensity } from '../lib/openai';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';
import { format, addMonths } from 'date-fns';

interface HumanizedResult {
  text: string;
}

const MobileHumanizer: React.FC = () => {
  const navigate = useNavigate();
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);
  const user = useAuthStore((state) => state.user);
  
  const [text, setText] = useState('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizedResult, setHumanizedResult] = useState<HumanizedResult | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<HumanizerIntensity>('HIGH');
  const [showWordLimitModal, setShowWordLimitModal] = useState(false);
  const [showMonthlyLimitModal, setShowMonthlyLimitModal] = useState(false);
  const [showNotEnoughWordsModal, setShowNotEnoughWordsModal] = useState(false);
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [wordsRemaining, setWordsRemaining] = useState(0);

  // Set CSS variables for mobile styling
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--bg-color', isDark ? '#202123' : '#f9fafb');
    document.documentElement.style.setProperty('--card-bg', isDark ? '#2d2d30' : '#ffffff');
    document.documentElement.style.setProperty('--text-primary', isDark ? '#ffffff' : '#111827');
    document.documentElement.style.setProperty('--text-secondary', isDark ? '#9ca3af' : '#4b5563');
    document.documentElement.style.setProperty('--border-color', isDark ? '#3f3f46' : '#e5e7eb');
    document.documentElement.style.setProperty('--button-bg', 'linear-gradient(90deg, #8b5cf6, #ec4899)');
    document.documentElement.style.setProperty('--button-text', '#ffffff');
    document.documentElement.style.setProperty('--progress-bg', isDark ? '#374151' : '#e5e7eb');
  }, []);

  // Calculate word count when text changes
  useEffect(() => {
    const wordCount = text.trim() ? text.split(/\s+/).filter(Boolean).length : 0;
    setCurrentWordCount(wordCount);
  }, [text]);

  const handleHumanize = async () => {
    if (!text.trim() || !user) return;
    setError(null);

    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    // Check if we have usage data
    if (!usage) {
      return; // Can't proceed without knowing usage limits
    }
    
    // Check if word count exceeds max request limit (per-request limit)
    if (usage.max_request_words && wordCount > usage.max_request_words) {
      setShowWordLimitModal(true);
      return;
    }
    
    // Check if user has enough words left for this request
    const remainingWords = usage.allocated_words - usage.used_words;
    setWordsRemaining(remainingWords);
    
    if (remainingWords <= 0) {
      // User has no words left (reached monthly limit)
      setShowMonthlyLimitModal(true);
      return;
    } else if (wordCount > remainingWords) {
      // User has some words left, but not enough for this request
      setShowNotEnoughWordsModal(true);
      return;
    }
    
    // If we get here, user has enough words for this request
    const { canProceed, error } = await useSubscriptionStore.getState().checkUsage(
      user.id, 
      charCount,
      wordCount
    );
    
    if (!canProceed) {
      // This is a fallback in case our frontend calculation was wrong
      setShowMonthlyLimitModal(true);
      return;
    }

    setIsHumanizing(true);
    try {
      const humanizedText = await humanizeText(text, intensity);
      setHumanizedResult({ text: humanizedText });
      useSubscriptionStore.getState().fetchUsage(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to humanize text. Please try again.');
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    setShowWordLimitModal(false);
    setShowMonthlyLimitModal(false);
    setShowNotEnoughWordsModal(false);
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score <= 20) return '#10b981'; // green
    if (score <= 45) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // Function to calculate and format the next reset date
  const getNextResetDate = () => {
    if (!usage?.last_reset) return 'your next billing cycle';
    
    try {
      // Parse the last_reset timestamp and add one month
      const lastReset = new Date(usage.last_reset);
      const nextReset = addMonths(lastReset, 1);
      return format(nextReset, 'MMMM d, yyyy'); // e.g., "August 15, 2023"
    } catch (err) {
      console.error('Error calculating next reset date:', err);
      return 'your next billing cycle';
    }
  };

  const styles = {
    container: {
      padding: '16px 16px 80px 16px',
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      position: 'relative' as 'relative',
      width: '100%',
      overflowX: 'hidden' as 'hidden'
    },
    card: {
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
    },
    headerIcon: {
      padding: '8px',
      borderRadius: '8px',
      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
      color: 'white',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      margin: 0,
    },
    subtitle: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      margin: 0,
      marginTop: '4px',
    },
    intensityContainer: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '12px',
    },
    intensityLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
    },
    intensityButtons: {
      display: 'flex',
      gap: '8px',
    },
    intensityButton: (isActive: boolean, level: string) => ({
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      background: isActive 
        ? level === 'LOW' 
          ? 'linear-gradient(90deg, #3b82f6, #0ea5e9)' 
          : level === 'MEDIUM'
            ? 'linear-gradient(90deg, #8b5cf6, #ec4899)'
            : 'linear-gradient(90deg, #f97316, #ef4444)'
        : 'var(--bg-color)',
      color: isActive ? 'white' : 'var(--text-primary)',
    }),
    intensityDescription: {
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      marginTop: '8px',
    },
    textareaContainer: {
      position: 'relative' as 'relative',
    },
    textarea: {
      width: '100%',
      height: '200px',
      padding: '12px',
      paddingRight: '40px',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      fontSize: '0.875rem',
      resize: 'none' as 'none',
      fontFamily: 'inherit',
    },
    textareaInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      marginBottom: '8px',
    },
    copyButton: {
      position: 'absolute' as 'absolute',
      top: '8px',
      right: '8px',
      background: 'none',
      border: 'none',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      padding: '4px',
    },
    actionBar: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '8px',
    },
    clearButton: {
      background: 'none',
      border: 'none',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
    },
    humanizeButton: (disabled: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: disabled ? '#9ca3af' : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }),
    scoreDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
    },
    scoreValue: (score: number) => ({
      fontWeight: 'bold',
      color: getScoreColor(score),
    }),
    modal: {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      padding: '16px',
    },
    modalContent: {
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      padding: '20px',
      width: '100%',
      maxWidth: '320px',
      position: 'relative' as 'relative',
    },
    modalCloseButton: {
      position: 'absolute' as 'absolute',
      top: '12px',
      right: '12px',
      background: 'none',
      border: 'none',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
    },
    modalIconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    modalIcon: (type: string) => ({
      padding: '12px',
      borderRadius: '50%',
      backgroundColor: type === 'error' 
        ? 'rgba(239, 68, 68, 0.1)' 
        : type === 'warning' 
          ? 'rgba(245, 158, 11, 0.1)' 
          : 'rgba(59, 130, 246, 0.1)',
      color: type === 'error' 
        ? '#ef4444' 
        : type === 'warning' 
          ? '#f59e0b' 
          : '#3b82f6',
    }),
    modalTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      textAlign: 'center' as 'center',
      marginBottom: '8px',
    },
    modalText: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      textAlign: 'center' as 'center',
      marginBottom: '16px',
    },
    modalButtonContainer: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '8px',
    },
    modalCancelButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
    modalActionButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
    progressContainer: {
      width: '100%', 
      height: '8px',
      backgroundColor: 'var(--progress-bg)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px',
    },
    progressBar: (percentage: number) => ({
      height: '100%',
      width: `${percentage}%`,
      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    }),
    progressStats: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      marginBottom: '16px',
    },
    errorContainer: {
      display: 'flex',
      gap: '8px',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      marginBottom: '16px',
    },
    errorText: {
      fontSize: '0.875rem',
      color: '#ef4444',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerContainer}>
        <div style={styles.headerIcon}>
          <Sparkles size={20} />
        </div>
        <div>
          <h1 style={styles.title}>AI Text Humanizer</h1>
          <p style={styles.subtitle}>Transform AI-generated content into natural, human-like text.</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <div style={styles.errorText}>{error}</div>
        </div>
      )}

      {/* Intensity Selector */}
      <div style={styles.card}>
        <div style={styles.intensityContainer}>
          <div style={styles.intensityLabel}>
            <Sliders size={16} />
            <span>Humanization Intensity</span>
          </div>
          <div style={styles.intensityButtons}>
            <button 
              onClick={() => setIntensity('LOW')}
              style={styles.intensityButton(intensity === 'LOW', 'LOW')}
            >
              LOW
            </button>
            <button 
              onClick={() => setIntensity('MEDIUM')}
              style={styles.intensityButton(intensity === 'MEDIUM', 'MEDIUM')}
            >
              MEDIUM
            </button>
            <button 
              onClick={() => setIntensity('HIGH')}
              style={styles.intensityButton(intensity === 'HIGH', 'HIGH')}
            >
              HIGH
            </button>
          </div>
          <div style={styles.intensityDescription}>
            {intensity === 'LOW' && 'Subtle changes while maintaining original style'}
            {intensity === 'MEDIUM' && 'Balanced humanization with moderate adjustments'}
            {intensity === 'HIGH' && 'Maximum humanization with significant rewrites'}
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div style={styles.card}>
        <div style={styles.textareaInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={16} />
            <span>AI Text</span>
          </div>
          <div>{text.length} characters | {currentWordCount} words</div>
        </div>
        <div style={styles.textareaContainer}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            style={styles.textarea}
          />
          <button 
            onClick={() => copyToClipboard(text)}
            style={styles.copyButton}
          >
            {showCopyTooltip ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          </button>
        </div>
        <div style={styles.actionBar}>
          <button
            onClick={() => setText('')}
            style={styles.clearButton}
          >
            Clear text
          </button>
          <button
            onClick={handleHumanize}
            disabled={isHumanizing || !text.trim()}
            style={styles.humanizeButton(isHumanizing || !text.trim())}
          >
            {isHumanizing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Humanizing...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Humanize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Box */}
      <div style={styles.card}>
        <div style={styles.textareaInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} />
            <span>Humanized Text</span>
          </div>
          {humanizedResult && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              <span>
                {humanizedResult.text.length} chars | {humanizedResult.text.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          )}
        </div>
        <div style={styles.textareaContainer}>
          <textarea
            value={humanizedResult?.text || ''}
            readOnly
            placeholder="Humanized text will appear here..."
            style={{
              ...styles.textarea,
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
            }}
          />
          {humanizedResult && (
            <button 
              onClick={() => copyToClipboard(humanizedResult.text)}
              style={styles.copyButton}
            >
              {showCopyTooltip ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            </button>
          )}
        </div>
        <div style={styles.actionBar}>
          {humanizedResult && (
            <div></div>
          )}
          {humanizedResult && (
            <button
              onClick={handleHumanize}
              disabled={isHumanizing}
              style={{
                ...styles.humanizeButton(isHumanizing),
                background: 'linear-gradient(90deg, #10b981, #059669)',
              }}
            >
              Re-Humanize
            </button>
          )}
        </div>
      </div>

      {/* Word Limit Modal */}
      {showWordLimitModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button 
              onClick={() => setShowWordLimitModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={20} />
            </button>
            <div style={styles.modalIconContainer}>
              <div style={styles.modalIcon('error')}>
                <AlertCircle size={24} color="#ef4444" />
              </div>
            </div>
            <h3 style={styles.modalTitle}>Word Limit Exceeded</h3>
            <p style={styles.modalText}>
              You've exceeded the word limit for a single request. Your current plan allows 
              <strong> {usage?.max_request_words || 250} words </strong> 
              per request, but you're trying to process 
              <strong> {currentWordCount} words</strong>.
            </p>
            <div style={styles.modalButtonContainer}>
              <button
                onClick={() => setShowWordLimitModal(false)}
                style={styles.modalCancelButton}
              >
                Reduce Text
              </button>
              <button
                onClick={handleUpgrade}
                style={styles.modalActionButton}
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Limit Modal */}
      {showMonthlyLimitModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button 
              onClick={() => setShowMonthlyLimitModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={20} />
            </button>
            <div style={styles.modalIconContainer}>
              <div style={styles.modalIcon('warning')}>
                <AlertCircle size={24} color="#f59e0b" />
              </div>
            </div>
            <h3 style={styles.modalTitle}>Monthly Word Limit Reached</h3>
            <p style={styles.modalText}>
              You've used all {usage?.allocated_words || 500} words in your monthly allocation.
              Your usage will reset on <strong>{getNextResetDate()}</strong>.
            </p>
            <div style={styles.progressContainer}>
              <div style={styles.progressBar(100)} />
            </div>
            <div style={styles.progressStats}>
              <span>Used: {usage?.used_words || 0}</span>
              <span>Total: {usage?.allocated_words || 500}</span>
            </div>
            <div style={styles.modalButtonContainer}>
              <button
                onClick={() => setShowMonthlyLimitModal(false)}
                style={styles.modalCancelButton}
              >
                Close
              </button>
              <button
                onClick={handleUpgrade}
                style={styles.modalActionButton}
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Enough Words Modal */}
      {showNotEnoughWordsModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button 
              onClick={() => setShowNotEnoughWordsModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={20} />
            </button>
            <div style={styles.modalIconContainer}>
              <div style={styles.modalIcon('info')}>
                <AlertCircle size={24} color="#3b82f6" />
              </div>
            </div>
            <h3 style={styles.modalTitle}>Not Enough Words Remaining</h3>
            <p style={styles.modalText}>
              You're trying to process <strong>{currentWordCount} words</strong>, but you only have <strong>{wordsRemaining} words</strong> remaining in your monthly allocation.
            </p>
            <div style={styles.progressContainer}>
              <div style={styles.progressBar(Math.min(((usage?.used_words || 0) / (usage?.allocated_words || 1)) * 100, 100))} />
            </div>
            <div style={styles.progressStats}>
              <span>Used: {usage?.used_words || 0}</span>
              <span>Total: {usage?.allocated_words || 500}</span>
            </div>
            <div style={styles.modalButtonContainer}>
              <button
                onClick={() => setShowNotEnoughWordsModal(false)}
                style={styles.modalCancelButton}
              >
                Reduce Text
              </button>
              <button
                onClick={handleUpgrade}
                style={styles.modalActionButton}
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHumanizer;