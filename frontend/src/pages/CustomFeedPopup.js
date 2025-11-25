import React, { useState } from 'react';

const BASE_BUTTON_STYLE = {
  padding: '10px 20px',
  borderRadius: '20px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginLeft: '10px',
  transition: 'background-color 0.2s',
  border: 'none',
};

const CustomFeedPopup = ({ onClose, onSubmit, initialFeed = null }) => {
  const [name, setName] = useState(initialFeed?.name || '');
  const [description, setDescription] = useState(initialFeed?.description || '');
  const [isPrivate, setIsPrivate] = useState(initialFeed?.isPrivate || false);
  const [showOnProfile, setShowOnProfile] = useState(initialFeed?.showOnProfile || true); // Assuming default is true
  const isEditing = !!initialFeed;

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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
      width: '100%', maxWidth: '500px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      position: 'relative',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px',
    },
    title: { fontSize: '20px', fontWeight: '700', margin: 0 },
    closeButton: {
      background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer',
      color: '#657786', padding: '4px', borderRadius: '50%', lineHeight: 1,
    },
    inputArea: { marginBottom: '20px' },
    input: {
      width: '100%', padding: '12px 15px', border: '1px solid #ccd6dd',
      borderRadius: '8px', boxSizing: 'border-box', fontSize: '15px',
      backgroundColor: '#f5f8fa',
    },
    textArea: { resize: 'vertical', minHeight: '100px' },
    charCount: { fontSize: '13px', color: '#657786', textAlign: 'right', marginTop: '4px' },
    toggleRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0',
    },
    toggleInfo: { display: 'flex', flexDirection: 'column' },
    toggleLabel: { fontWeight: '600', fontSize: '16px' },
    toggleDescription: { fontSize: '14px', color: '#657786', marginTop: '4px' },
    footer: {
      display: 'flex', justifyContent: 'flex-end', paddingTop: '20px',
      borderTop: '1px solid #e6ecf0', marginTop: '20px',
    },
    cancelButton: {
      ...BASE_BUTTON_STYLE,
      backgroundColor: '#e6ecf0',
      color: '#14171a',
    },
    submitButtonBase: BASE_BUTTON_STYLE,
    checkboxIndicator: {
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s',
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
      transition: 'background-color 0.3s, opacity 0.3s',
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
            backgroundColor: checked ? '#1da1f2' : '#ccd6dd',
            justifyContent: checked ? 'flex-end' : 'flex-start'
          }}
        >
          <div style={styles.checkboxIndicator}>
            {isShowOnProfile && checked && (
              <span style={{color: '#1da1f2', fontSize: '14px', fontWeight: 'bold', transform: 'scaleX(-1)'}}>
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
          {/* ... (Input fields and ToggleSwitches remain the same, using state: name, description, isPrivate, showOnProfile) ... */}
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
                backgroundColor: name ? '#1da1f2' : '#ccd6dd',
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