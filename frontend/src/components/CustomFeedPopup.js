import React, { useState } from 'react';

const CustomFeedPopup = ({ onClose, onSubmit, initialFeed = null }) => {
  const [name, setName] = useState(initialFeed?.name || '');
  const [description, setDescription] = useState(initialFeed?.description || '');
  const [isPrivate, setIsPrivate] = useState(initialFeed?.isPrivate ?? false);
  const [showOnProfile, setShowOnProfile] = useState(initialFeed?.showOnProfile ?? true);
  const isEditing = !!initialFeed;

  // Detect theme
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
    return 'light';
  });

  // Update theme on changes
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Theme-based color variables
  const colors = {
    light: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      modalBg: '#fff',
      shadow: 'rgba(0, 0, 0, 0.15)',
      title: '#14171a',
      closeButton: '#657786',
      inputBorder: '#ccd6dd',
      inputBg: '#f5f8fa',
      inputText: '#14171a',
      charCount: '#657786',
      toggleLabel: '#14171a',
      toggleDescription: '#657786',
      footerBorder: '#e6ecf0',
      cancelButtonBg: '#e6ecf0',
      cancelButtonText: '#14171a',
      submitButtonDisabled: '#ccd6dd',
      toggleBgChecked: '#1da1f2',
      toggleBgUnchecked: '#ccd6dd',
      checkboxIndicator: '#fff',
      checkboxCheckmark: '#1da1f2'
    },
    dark: {
      backdrop: 'rgba(0, 0, 0, 0.7)',
      modalBg: '#2d2d2d',
      shadow: 'rgba(0, 0, 0, 0.3)',
      title: '#f5f5f5',
      closeButton: '#aaa',
      inputBorder: '#555',
      inputBg: '#3a3a3a',
      inputText: '#f5f5f5',
      charCount: '#aaa',
      toggleLabel: '#f5f5f5',
      toggleDescription: '#bbb',
      footerBorder: '#444',
      cancelButtonBg: '#444',
      cancelButtonText: '#f5f5f5',
      submitButtonDisabled: '#666',
      toggleBgChecked: '#1da1f2',
      toggleBgUnchecked: '#555',
      checkboxIndicator: '#444',
      checkboxCheckmark: '#66b0ff'
    }
  };

  const currentColors = colors[theme];

  const BASE_BUTTON_STYLE = {
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginLeft: '10px',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const handleTogglePrivate = (newIsPrivate) => {
    setIsPrivate(newIsPrivate);
    if (newIsPrivate) setShowOnProfile(false);
  };
  
  const handleToggleShowOnProfile = (newShowOnProfile) => {
    if (!isPrivate) {
      setShowOnProfile(newShowOnProfile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...initialFeed,
      name, 
      description, 
      isPrivate, 
      showOnProfile 
    });
    onClose(); 
  };

  const styles = {
    backdrop: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: currentColors.backdrop,
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      transition: 'background-color 0.3s ease',
    },
    modal: {
      backgroundColor: currentColors.modalBg,
      borderRadius: '12px', padding: '24px',
      width: '100%', maxWidth: '500px', 
      boxShadow: `0 4px 12px ${currentColors.shadow}`,
      position: 'relative',
      transition: 'all 0.3s ease',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px',
    },
    title: { 
      fontSize: '20px', 
      fontWeight: '700', 
      margin: 0,
      color: currentColors.title,
      transition: 'color 0.3s ease',
    },
    closeButton: {
      background: 'none', 
      border: 'none', 
      fontSize: '24px', 
      cursor: 'pointer',
      color: currentColors.closeButton, 
      padding: '4px', 
      borderRadius: '50%', 
      lineHeight: 1,
      transition: 'all 0.3s ease',
    },
    inputArea: { marginBottom: '20px' },
    input: {
      width: '100%', 
      padding: '12px 15px', 
      border: `1px solid ${currentColors.inputBorder}`,
      borderRadius: '8px', 
      boxSizing: 'border-box', 
      fontSize: '15px',
      backgroundColor: currentColors.inputBg,
      color: currentColors.inputText,
      transition: 'all 0.3s ease',
    },
    textArea: { resize: 'vertical', minHeight: '100px' },
    charCount: { 
      fontSize: '13px', 
      color: currentColors.charCount, 
      textAlign: 'right', 
      marginTop: '4px',
      transition: 'color 0.3s ease',
    },
    toggleRow: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 0',
      transition: 'all 0.3s ease',
    },
    toggleInfo: { display: 'flex', flexDirection: 'column' },
    toggleLabel: { 
      fontWeight: '600', 
      fontSize: '16px',
      color: currentColors.toggleLabel,
      transition: 'color 0.3s ease',
    },
    toggleDescription: { 
      fontSize: '14px', 
      color: currentColors.toggleDescription, 
      marginTop: '4px',
      transition: 'color 0.3s ease',
    },
    footer: {
      display: 'flex', 
      justifyContent: 'flex-end', 
      paddingTop: '20px',
      borderTop: `1px solid ${currentColors.footerBorder}`, 
      marginTop: '20px',
      transition: 'border-color 0.3s ease',
    },
    cancelButton: {
      ...BASE_BUTTON_STYLE,
      backgroundColor: currentColors.cancelButtonBg,
      color: currentColors.cancelButtonText,
    },
    submitButtonBase: BASE_BUTTON_STYLE,
    checkboxIndicator: {
      width: '20px',
      height: '20px',
      backgroundColor: currentColors.checkboxIndicator,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    checkboxPlaceholderBase: {
      width: '40px',
      height: '24px',
      borderRadius: '12px',
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '2px',
      transition: 'all 0.3s ease',
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => {
    const isShowOnProfile = label === "Show on profile";
    const isDisabled = isShowOnProfile && isPrivate; 
    const opacity = isDisabled ? 0.5 : 1;
    const cursor = isDisabled ? 'not-allowed' : 'pointer';

    return (
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <span style={styles.toggleLabel}>{label}</span>
          <span style={styles.toggleDescription}>{description}</span>
        </div>
        
        <div
          onClick={() => { if (!isDisabled) onChange(!checked); }}
          style={{
            ...styles.checkboxPlaceholderBase,
            cursor: cursor,
            opacity: opacity, 
            backgroundColor: checked ? currentColors.toggleBgChecked : currentColors.toggleBgUnchecked,
            justifyContent: checked ? 'flex-end' : 'flex-start'
          }}
        >
          <div style={styles.checkboxIndicator}>
            {isShowOnProfile && checked && (
              <span style={{
                color: currentColors.checkboxCheckmark, 
                fontSize: '14px', 
                fontWeight: 'bold', 
                transform: 'scaleX(-1)',
                transition: 'color 0.3s ease',
              }}>
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{isEditing ? 'Edit custom feed' : 'Create custom feed'}</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputArea}>
            <input
              type="text"
              placeholder="Name*"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
            <div style={styles.charCount}>{50 - name.length}</div>
          </div>

          <div style={styles.inputArea}>
            <textarea
              placeholder="Description"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...styles.input, ...styles.textArea }}
            />
            <div style={styles.charCount}>{500 - description.length}</div>
          </div>
          
          <ToggleSwitch
            label="Make private"
            description="Only viewable by you"
            checked={isPrivate}
            onChange={handleTogglePrivate}
          />
          
          <ToggleSwitch
            label="Show on profile"
            description="Display this feed on your profile so others can find it"
            checked={showOnProfile}
            onChange={handleToggleShowOnProfile}
          />

          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name}
              style={{
                ...styles.submitButtonBase,
                backgroundColor: name ? currentColors.toggleBgChecked : currentColors.submitButtonDisabled,
                color: '#fff'
              }}
            >
              {isEditing ? 'Save Changes' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomFeedPopup;