import React from 'react';
import { HelpCircle, CheckCircle, AlertTriangle, Sparkles, Brain, Shield, RefreshCw, FileCheck, Pencil } from 'lucide-react';

const MobileGuide: React.FC = () => {
  // Set CSS variables for mobile styling
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--bg-color', isDark ? '#202123' : '#f9fafb');
    document.documentElement.style.setProperty('--card-bg', isDark ? '#2d2d30' : '#ffffff');
    document.documentElement.style.setProperty('--text-primary', isDark ? '#ffffff' : '#111827');
    document.documentElement.style.setProperty('--text-secondary', isDark ? '#9ca3af' : '#4b5563');
    document.documentElement.style.setProperty('--border-color', isDark ? '#3f3f46' : '#e5e7eb');
  }, []);

  const styles = {
    container: {
      padding: '16px 16px 80px 16px',
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
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
      background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
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
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      marginBottom: '16px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      marginTop: '12px',
    },
    listItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '12px',
    },
    iconContainer: (color: string) => ({
      padding: '6px',
      borderRadius: '8px',
      backgroundColor: `${color}10`,
      color: color,
      flexShrink: 0,
    }),
    itemTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
      marginBottom: '4px',
    },
    itemText: {
      fontSize: '0.813rem',
      color: 'var(--text-secondary)',
      lineHeight: '1.4',
    },
    alert: (color: string) => ({
      backgroundColor: `${color}10`,
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '12px',
      border: `1px solid ${color}20`,
    }),
    alertTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
      marginBottom: '4px',
    },
    alertText: {
      fontSize: '0.813rem',
      color: 'var(--text-secondary)',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerContainer}>
        <div style={styles.headerIcon}>
          <HelpCircle size={20} />
        </div>
        <div>
          <h1 style={styles.title}>User Guide</h1>
          <p style={styles.subtitle}>Learn how to get the most out of StealthText</p>
        </div>
      </div>

      {/* Getting Started */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <Brain size={18} color="#3b82f6" />
          Getting Started
        </h2>
        <p style={styles.itemText}>
          StealthText helps you transform AI-generated content into natural, human-like text. Here's how to get started:
        </p>
        <ol style={{ ...styles.list, listStyleType: 'decimal', paddingLeft: '20px' }}>
          <li style={{ ...styles.itemText, marginBottom: '8px' }}>Navigate to the Humanizer page</li>
          <li style={{ ...styles.itemText, marginBottom: '8px' }}>Paste your AI-generated text into the input box</li>
          <li style={{ ...styles.itemText, marginBottom: '8px' }}>Select your desired humanization intensity</li>
          <li style={{ ...styles.itemText, marginBottom: '8px' }}>Click "Humanize" to process your text</li>
          <li style={{ ...styles.itemText }}>Review and refine the output as needed</li>
        </ol>
      </div>

      {/* Best Practices */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <CheckCircle size={18} color="#10b981" />
          Best Practices
        </h2>
        <div style={styles.list}>
          <div style={styles.listItem}>
            <div style={styles.iconContainer('#10b981')}>
              <FileCheck size={16} />
            </div>
            <div>
              <h3 style={styles.itemTitle}>Review Before Processing</h3>
              <p style={styles.itemText}>
                Clean up obvious errors and formatting issues in your text before humanizing.
              </p>
            </div>
          </div>
          <div style={styles.listItem}>
            <div style={styles.iconContainer('#10b981')}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={styles.itemTitle}>Start with Medium Intensity</h3>
              <p style={styles.itemText}>
                Begin with medium intensity and adjust based on results.
              </p>
            </div>
          </div>
          <div style={styles.listItem}>
            <div style={styles.iconContainer('#10b981')}>
              <Shield size={16} />
            </div>
            <div>
              <h3 style={styles.itemTitle}>Verify with AI Detection</h3>
              <p style={styles.itemText}>
                Use our AI Detection tool to check your humanized text.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <AlertTriangle size={18} color="#eab308" />
          Important Notes
        </h2>
        <div style={styles.alert('#eab308')}>
          <h3 style={styles.alertTitle}>Multiple Attempts May Be Needed</h3>
          <p style={styles.alertText}>
            Some text may require multiple humanization attempts to achieve optimal results.
          </p>
        </div>
        <div style={styles.alert('#3b82f6')}>
          <h3 style={styles.alertTitle}>Grammar and Style</h3>
          <p style={styles.alertText}>
            Always review the output for clarity and correctness as variations may occur.
          </p>
        </div>
        <div style={styles.alert('#8b5cf6')}>
          <h3 style={styles.alertTitle}>Content Length</h3>
          <p style={styles.alertText}>
            Process text in reasonable chunks for best results.
          </p>
        </div>
      </div>

      {/* Optimization Tips */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <Pencil size={18} color="#8b5cf6" />
          Optimization Tips
        </h2>
        <div style={styles.list}>
          <div style={styles.listItem}>
            <div style={styles.iconContainer('#8b5cf6')}>
              <RefreshCw size={16} />
            </div>
            <div>
              <h3 style={styles.itemTitle}>Iterate and Refine</h3>
              <p style={styles.itemText}>
                Try multiple passes with different intensity levels.
              </p>
            </div>
          </div>
          <div style={styles.listItem}>
            <div style={styles.iconContainer('#8b5cf6')}>
              <RefreshCw size={16} />
            </div>
            <div>
              <h3 style={styles.itemTitle}>Break Up Long Content</h3>
              <p style={styles.itemText}>
                Process long texts in smaller sections.
              </p>
            </div>
          </div>
          <div style={styles.listItem}>
            <div style={styles.iconContainer('#8b5cf6')}>
              <RefreshCw size={16} />
            </div>
            <div>
              <h3 style={styles.itemTitle}>Final Review</h3>
              <p style={styles.itemText}>
                Always check the complete text for coherence and flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileGuide;