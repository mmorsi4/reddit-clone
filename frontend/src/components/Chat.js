import React from 'react';
import "../styles/chat.css";

const Chat = ({ onClose }) => {

  const handleStartNewChat = () => {
    console.log("Start new chat button clicked.");
  };

  return (
    <div className="chat-popup-container">
      
      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-header__title-group">
            <img src="../images/reddit-logo.svg" alt="Reddit Logo" className="chat-header__logo" />
            <span className="chat-header__title">Chats</span>
            
            <div className="chat-header__action-icons">
              <img src="../images/envelope.svg" alt="Messages" className="chat-header__icon" />
              <img src="../images/chat-1.svg" alt="New Chat" className="chat-header__icon" />
              <img src="../images/setting.svg" alt="New Chat" className="chat-header__icon" />
              <img src="../images/down.svg" alt="Menu" className="chat-header__icon chat-header__icon--rotated" />
            </div>
          </div>
          
          <div className="chat-header__controls">
            <img src="../images/expand.svg" alt="Expand" className="chat-header__control-icon" /> 
            <img src="../images/down.svg" alt="Minimize" className="chat-header__control-icon" />
            <img 
                src="../images/close.svg" 
                alt="Close" 
                className="chat-header__control-icon chat-header__control-icon--close"
                onClick={onClose} 
            />
          </div>
        </div>
        
        <div className="chat-content-area">
          <div className="chat-sidebar"> 
            <div className="chat-sidebar__threads-header">
              <div className="chat-sidebar__threads-group">
                <img src="../images/arrow-left.svg" alt="Back" className="chat-sidebar__icon-back" />
                <span>Threads</span>
              </div>
              <img src="../images/arrow-right.svg" alt="Forward" className="chat-sidebar__icon-forward" />
            </div>
            <div className="chat-sidebar__empty-text">
              No recent chats.
            </div>
          </div>
          
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
              onClick={handleStartNewChat}
              className="chat-main__start-button"
            >
              <img src="../images/plus.svg" alt="Plus" className="chat-main__plus-icon" />
              Start new chat
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;