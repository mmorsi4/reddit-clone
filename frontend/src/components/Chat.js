import React, { useState } from 'react';
import "../styles/chat.css";


const NewChatForm = ({ onBack }) => {
  return (
    <div className="chat-main new-chat-view">
        
      {/* Input Area */}
      <div className="new-chat-input-area">
        <input 
          type="text" 
          placeholder="Type username(s) *" 
          className="new-chat-input"
        />
        <p className="new-chat-input-help">
          Search for people by username to chat with them.
        </p>
      </div>

      {/* Footer Controls */}
      <div className="new-chat-footer">
        <button onClick={onBack} className="new-chat-button new-chat-button--cancel">
          Cancel
        </button>
        <button className="new-chat-button new-chat-button--start">
          Start Chat
        </button>
      </div>
    </div>
  );
};

// --- Main Chat Pop-up Component ---
const Chat = ({ currentUserId, onClose }) => {
  const [currentView, setCurrentView] = useState('default'); 
  const [isMinimized, setIsMinimized] = useState(false);

  const handleStartNewChat = () => {
    setCurrentView('new_chat');
    console.log("Switched to new chat view.");
  };

  const handleBackToDefault = () => {
    setCurrentView('default');
  };

  const handleMinimizeToggle = () => {
    setIsMinimized(prev => !prev);
  };

  // Content for the default welcome screen
  const MainContent = (
    <div className="chat-main">
      <img 
        src="../images/chat-image.png" 
        alt="Welcome to chat illustration" 
        className="chat-main__illustration" 
      />
      <h2 className="chat-main__title">Welcome to chat!</h2>
      <p className="chat-main__subtitle">
        Start a direct or group chat with other redditors.
      </p>
      <button
        onClick={handleStartNewChat} // Triggers view change
        className="chat-main__start-button"
      >
        <img src="../images/plus.svg" alt="Plus" className="chat-main__plus-icon" />
        Start new chat
      </button>
    </div>
  );
  
  const MainAreaToRender = currentView === 'new_chat' 
    ? <NewChatForm onBack={handleBackToDefault} /> 
    : MainContent;


  return (
    <div className="chat-popup-container">
      {isMinimized && (
        <div className="chat-minimized" onClick={handleMinimizeToggle}>
          <span>Chat</span>
          <img 
            src="../images/close.svg" 
            alt="Close" 
            className="chat-minimized__close-icon"
            onClick={(e) => {
              e.stopPropagation(); 
              onClose();
            }} 
          />
        </div>
      )}
      <div className={`chat-window ${isMinimized ? 'chat-window--hidden' : ''}`}>
        <div className="chat-header">
          <div className="chat-header__title-group">
            <img src="../images/reddit-logo.svg" alt="Reddit Logo" className="chat-header__logo" />
            <span className="chat-header__title">
              {currentView === 'new_chat' ? 'New Chat' : 'Chats'} 
            </span>
              <div className="chat-header__action-icons">
                <img src="../images/envelope.svg" alt="Messages" className="chat-header__icon" />
                
                <span className="chat-header__icon-wrapper" onClick={handleStartNewChat}>
                  <img 
                    src="../images/chat-1.svg" 
                    alt="New Chat" 
                    className="chat-header__icon" 
                  />
                </span>
                
                <span className="chat-header__menu-wrapper">
                  <span className="chat-header__icon-wrapper">
                    <img src="../images/setting.svg" alt="Settings" className="chat-header__icon" />
                  </span>
                  <span className="chat-header__icon-wrapper">
                    <img src="../images/down.svg" alt="Menu" className="chat-header__icon chat-header__icon--rotated" />
                  </span>
                </span>
              </div>
          </div>
          
          <div className="chat-header__controls">
            <img src="../images/expand.svg" alt="Expand" className="chat-header__control-icon" /> 
            
            <img 
                src="../images/down.svg" 
                alt="Minimize" 
                className="chat-header__control-icon"
                onClick={handleMinimizeToggle} 
            />
            
            <img 
                src="../images/close.svg" 
                alt="Close" 
                className="chat-header__control-icon"
                onClick={onClose} 
            />
          </div>
        </div>
        
        <div className="chat-content-area">
          <div className="chat-sidebar"> 
            <div className="chat-sidebar__threads-header">
              <div className="chat-sidebar__threads-group">
                <img 
                  src="../images/arrow-left.svg" 
                  alt="Back" 
                  className="chat-sidebar__icon-back" 
                  onClick={currentView === 'new_chat' ? handleBackToDefault : null}
                  style={{ cursor: currentView === 'new_chat' ? 'pointer' : 'default' }}
                />
                <span>Threads</span>
              </div>
              <img src="../images/arrow-right.svg" alt="Forward" className="chat-sidebar__icon-forward" />
            </div>
            <div className="chat-sidebar__empty-text">
              No recent chats.
            </div>
          </div>
          
          {MainAreaToRender}

        </div>
      </div>
    </div>
  );
};

export default Chat;