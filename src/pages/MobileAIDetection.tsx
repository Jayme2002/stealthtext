import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Loader2, Check, AlertCircle, Sparkles, FileText, Shield, X } from 'lucide-react';
import { detectAI, AIDetectionResult } from '../lib/openai';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';

const MobileAIDetection: React.FC = () => {
  const navigate = useNavigate();
  const subscription = useSubscriptionStore((state) => state.subscription);
  const usage = useSubscriptionStore((state) => state.usage);
  const user = useAuthStore((state) => state.user);
  
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<AIDetectionResult | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWordLimitModal, setShowWordLimitModal] = useState(false);
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'tools' | 'details'>('summary');

  // Set CSS variables for mobile styling
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--bg-color', isDark ? '#202123' : '#f9fafb');
    document.documentElement.style.setProperty('--card-bg', isDark ? '#2d2d30' : '#ffffff');
    document.documentElement.style.setProperty('--text-primary', isDark ? '#ffffff' : '#111827');
    document.documentElement.style.setProperty('--text-secondary', isDark ? '#9ca3af' : '#4b5563');
    document.documentElement.style.setProperty('--border-color', isDark ? '#3f3f46' : '#e5e7eb');
    document.documentElement.style.setProperty('--button-bg', 'linear-gradient(90deg, #3b82f6, #06b6d4)');
    document.documentElement.style.setProperty('--button-text', '#ffffff');
    document.documentElement.style.setProperty('--progress-bg', isDark ? '#374151' : '#e5e7eb');
  }, []);

  // Calculate word count when text changes
  useEffect(() => {
    const wordCount = text.trim() ? text.split(/\s+/).filter(Boolean).length : 0;
    setCurrentWordCount(wordCount);
  }, [text]);

  const handleDetect = async () => {
    if (!text.trim() || !user) return;
    setError(null);

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

    setIsAnalyzing(true);
    try {
      const result = await detectAI(text);
      if (result) {
        setDetectionResult(result);
        if (user && useSubscriptionStore.getState().fetchUsage) {
          useSubscriptionStore.getState().fetchUsage(user.id);
        }
      } else {
        setError('Failed to analyze text. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const getOverallScore = () => {
    if (!detectionResult) return { ai: 0, human: 0, mixed: 0 };
    
    // Average scores from all tools
    const tools = [
      'turnitin', 'openai', 'gptzero', 'writer', 'crossplag',
      'copyleaks', 'sapling', 'contentatscale', 'zerogpt', 'human'
    ];
    
    let aiTotal = 0;
    let humanTotal = 0;
    let mixedTotal = 0;
    let toolCount = 0;
    
    for (const tool of tools) {
      if (detectionResult[tool as keyof AIDetectionResult]) {
        const scores = detectionResult[tool as keyof AIDetectionResult] as { ai: number, human: number, mixed: number };
        aiTotal += scores.ai;
        humanTotal += scores.human;
        mixedTotal += scores.mixed;
        toolCount++;
      }
    }
    
    if (toolCount === 0) return { ai: 0, human: 0, mixed: 0 };
    
    return {
      ai: Math.round((aiTotal / toolCount) * 100),
      human: Math.round((humanTotal / toolCount) * 100),
      mixed: Math.round((mixedTotal / toolCount) * 100)
    };
  };

  const getScoreColor = (score: number) => {
    if (score <= 33) return '#10b981'; // green
    if (score <= 66) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreDescription = (aiScore: number) => {
    if (aiScore <= 15) return 'This content appears to be primarily human-written.';
    if (aiScore <= 40) return 'This content shows minimal signs of AI generation.';
    if (aiScore <= 60) return 'This content shows mixed signals of both human and AI writing.';
    if (aiScore <= 85) return 'This content shows strong indicators of AI generation.';
    return 'This content appears to be primarily AI-generated.';
  };

  const getScoreAction = (aiScore: number) => {
    if (aiScore <= 40) return 'Good to go! This content should pass AI detection tools.';
    if (aiScore <= 65) return 'Consider using our Humanizer tool to make this content more human-like.';
    return 'Use our Humanizer tool to significantly reduce AI detection signals.';
  };

  const overallScore = getOverallScore();

  // Prepare top tools data for simple display
  const getTopToolScores = () => {
    if (!detectionResult) return [];
    
    const tools = [
      'openai', 'gptzero', 'turnitin', 'human'
    ];
    
    return tools
      .filter(tool => detectionResult[tool as keyof AIDetectionResult])
      .map(tool => {
        const toolData = detectionResult[tool as keyof AIDetectionResult] as { ai: number, human: number, mixed: number };
        return {
          name: tool.charAt(0).toUpperCase() + tool.slice(1),
          ai: Math.round(toolData.ai * 100),
          human: Math.round(toolData.human * 100)
        };
      });
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
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
    },
    headerIcon: {
      padding: '8px',
      borderRadius: '8px',
      background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
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
    card: {
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    textareaContainer: {
      position: 'relative' as 'relative',
    },
    textareaInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      marginBottom: '8px',
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
    detectButton: (disabled: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: disabled ? '#9ca3af' : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }),
    resultsContainer: {
      padding: '12px',
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      marginBottom: '16px',
    },
    tabContainer: {
      display: 'flex',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '12px',
    },
    tab: (isActive: boolean) => ({
      padding: '8px 12px',
      fontSize: '0.875rem',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? '#3b82f6' : 'var(--text-secondary)',
      borderBottom: isActive ? '2px solid #3b82f6' : 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    }),
    scoreContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    scoreTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
    },
    scoreValue: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '0.875rem',
      fontWeight: '600',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'var(--progress-bg)',
      borderRadius: '4px',
      marginBottom: '8px',
      overflow: 'hidden',
    },
    progressFill: (percent: number, color: string) => ({
      height: '100%',
      width: `${percent}%`,
      background: `linear-gradient(90deg, #10b981, ${color})`,
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    }),
    progressLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
      marginBottom: '16px',
    },
    analysisBox: {
      padding: '12px',
      backgroundColor: 'var(--bg-color)',
      borderRadius: '8px',
      marginBottom: '16px',
    },
    analysisTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '8px',
    },
    analysisText: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      lineHeight: '1.5',
    },
    humanizeButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '12px',
    },
    toolScoresList: {
      marginTop: '12px',
    },
    toolScoreItem: {
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      marginBottom: '8px',
    },
    toolHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
    },
    toolName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
    },
    toolScore: (score: number) => ({
      fontSize: '0.875rem',
      fontWeight: '600',
      color: getScoreColor(score),
    }),
    toolProgressBar: {
      width: '100%',
      height: '4px',
      backgroundColor: 'var(--progress-bg)',
      borderRadius: '2px',
      overflow: 'hidden',
    },
    toolProgressFill: (percent: number, color: string) => ({
      height: '100%',
      width: `${percent}%`,
      background: color,
      borderRadius: '2px',
    }),
    sentencesList: {
      marginTop: '12px',
      maxHeight: '200px',
      overflowY: 'auto' as 'auto',
    },
    sentenceItem: (probability: number) => ({
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid',
      borderColor: probability > 0.7 ? '#ef4444' : probability > 0.3 ? '#f59e0b' : '#10b981',
      backgroundColor: probability > 0.7 ? 'rgba(239, 68, 68, 0.1)' : probability > 0.3 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      marginBottom: '8px',
    }),
    sentenceText: {
      fontSize: '0.875rem',
      color: 'var(--text-primary)',
      marginBottom: '4px',
    },
    sentenceScore: {
      fontSize: '0.75rem',
      color: 'var(--text-secondary)',
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
    modalButtons: {
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
      background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center' as 'center',
    },
    emptyStateIcon: {
      color: 'var(--text-secondary)',
      opacity: 0.3,
      marginBottom: '16px',
    },
    emptyStateTitle: {
      fontSize: '1rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
      marginBottom: '8px',
    },
    emptyStateText: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      maxWidth: '250px',
      margin: '0 auto',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerContainer}>
        <div style={styles.headerIcon}>
          <Shield size={20} />
        </div>
        <div>
          <h1 style={styles.title}>AI Detection</h1>
          <p style={styles.subtitle}>Check if content was written by AI or human</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <div style={styles.errorText}>{error}</div>
        </div>
      )}

      {/* Input Box */}
      <div style={styles.card}>
        <div style={styles.textareaInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} />
            <span>Text to Analyze</span>
          </div>
          <div>{text.length} chars | {currentWordCount} words</div>
        </div>
        <div style={styles.textareaContainer}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here to analyze for AI detection..."
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
            onClick={handleDetect}
            disabled={isAnalyzing || !text.trim()}
            style={styles.detectButton(isAnalyzing || !text.trim())}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Shield size={16} />
                <span>Detect AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {!detectionResult ? (
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <Shield size={40} style={styles.emptyStateIcon} />
            <h3 style={styles.emptyStateTitle}>No Analysis Yet</h3>
            <p style={styles.emptyStateText}>
              Enter some text and click "Detect AI" to analyze if the content was written by an AI or a human.
            </p>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          {/* Tabs for results */}
          <div style={styles.tabContainer}>
            <button 
              style={styles.tab(activeTab === 'summary')}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button 
              style={styles.tab(activeTab === 'tools')}
              onClick={() => setActiveTab('tools')}
            >
              Tools
            </button>
            <button 
              style={styles.tab(activeTab === 'details')}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
          </div>
          
          {/* Tab content */}
          {activeTab === 'summary' && (
            <div>
              <div style={styles.scoreContainer}>
                <div style={styles.scoreTitle}>AI Detection Score</div>
                <div 
                  style={{
                    ...styles.scoreValue,
                    backgroundColor: `${overallScore.ai <= 33 ? 'rgba(16, 185, 129, 0.1)' : overallScore.ai <= 66 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                    color: getScoreColor(overallScore.ai)
                  }}
                >
                  {overallScore.ai}%
                </div>
              </div>
              
              <div style={styles.progressBar}>
                <div style={styles.progressFill(overallScore.ai, getScoreColor(overallScore.ai))} />
              </div>
              
              <div style={styles.progressLabels}>
                <span>Human</span>
                <span>Mixed</span>
                <span>AI</span>
              </div>
              
              <div style={styles.analysisBox}>
                <h4 style={styles.analysisTitle}>Analysis</h4>
                <p style={styles.analysisText}>{getScoreDescription(overallScore.ai)}</p>
              </div>
              
              <div style={styles.analysisBox}>
                <h4 style={styles.analysisTitle}>Recommendation</h4>
                <p style={styles.analysisText}>{getScoreAction(overallScore.ai)}</p>
                
                {overallScore.ai > 40 && (
                  <button 
                    style={styles.humanizeButton}
                    onClick={() => navigate('/humanizer')}
                  >
                    <Sparkles size={16} />
                    Humanize This Text
                  </button>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'tools' && (
            <div style={styles.toolScoresList}>
              {getTopToolScores().map((tool, index) => (
                <div key={index} style={styles.toolScoreItem}>
                  <div style={styles.toolHeader}>
                    <div style={styles.toolName}>{tool.name}</div>
                    <div style={styles.toolScore(tool.ai)}>AI: {tool.ai}%</div>
                  </div>
                  <div style={styles.toolProgressBar}>
                    <div 
                      style={styles.toolProgressFill(tool.ai, getScoreColor(tool.ai))} 
                    />
                  </div>
                </div>
              ))}
              
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                textAlign: 'center',
                marginTop: '12px'
              }}>
                Scores from multiple AI detection tools
              </div>
            </div>
          )}
          
          {activeTab === 'details' && (
            <div style={styles.sentencesList}>
              {detectionResult.sentences.map((sentence, index) => (
                <div 
                  key={index} 
                  style={styles.sentenceItem(sentence.generatedProb)}
                >
                  <p style={styles.sentenceText}>{sentence.sentence}</p>
                  <p style={styles.sentenceScore}>
                    AI Probability: {Math.round(sentence.generatedProb * 100)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Word Limit Modal */}
      {showWordLimitModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button 
              style={styles.modalCloseButton}
              onClick={() => setShowWordLimitModal(false)}
            >
              <X size={20} />
            </button>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '16px' 
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
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
            
            <div style={styles.modalButtons}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setShowWordLimitModal(false)}
              >
                Reduce Text
              </button>
              <button
                style={styles.modalActionButton}
                onClick={() => navigate('/pricing')}
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

export default MobileAIDetection;