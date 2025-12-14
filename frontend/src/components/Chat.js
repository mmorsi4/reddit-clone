import React, { useState, useEffect, useRef, use } from 'react';
import "../styles/chat.css";
import { io } from 'socket.io-client';
import socket from "../socket";

const NewChatForm = ({ onBack, users, onStartChat, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserResults, setShowUserResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const results = users
      .filter(u => u.username && u.username.toLowerCase().includes(lowerTerm) && u._id != currentUserId)
      .slice(0, 5);
    setFilteredUsers(results);
  }, [searchTerm, users]);

  return (
    <div className="chat-main new-chat-view">
      {/* Input Area */}
      <div className="new-chat-input-area" ref={searchRef}>
        <div className="chat-search-bar">
          <input
            type="text"
            placeholder="Type username(s) *"
            className="new-chat-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowUserResults(true);
            }}
            onFocus={() => setShowUserResults(true)}
          />
        </div>
        <p className="new-chat-input-help">
          Search for people by username to chat with them.
        </p>

        {showUserResults && filteredUsers.length > 0 && (
          <div className="chat-search-results">
            <ul>
              {filteredUsers.map((user, idx) => (
                <li key={idx} onClick={() => onStartChat(user)}>
                  <img
                    src={user.avatar || "../images/avatar.png"}
                    alt={user.username}
                    className="chat-user-avatar"
                  />
                  <span className="chat-user-name">{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="new-chat-footer">
        <button onClick={onBack} className="new-chat-button new-chat-button--cancel">
          Cancel
        </button>
        <button
          className="new-chat-button new-chat-button--start"
          onClick={() => onStartChat(filteredUsers[0])}
          disabled={filteredUsers.length === 0}
        >
          Start Chat
        </button>
      </div>
    </div>
  );
};

// actual chat
const ChatWindow = ({ user, messages, onSend }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSend(newMessage);
    setNewMessage('');
  };

  // auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window-component">
      <div className="chat-window-header">
        <img src={"../images/avatar.png"} className="chat-message-avatar" />
        <span className="chat-window-title">{user.username}</span>
      </div>

      <div className="chat-window-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chat-message">
            <img src={msg.sender.avatar || "../images/avatar.png"} className="chat-message-avatar" />
            <div className="chat-message-content">
              <div className="chat-message-header">
                <span className="chat-message-username">{msg.sender.username}</span>
                <span className="chat-message-time">{new Date(msg.time).toLocaleTimeString()}</span>
              </div>
              <div className="chat-message-text">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div> {/* we autoscroll to this on messages change */}
      </div>

      <div className="chat-window-input">
        <input
          type="text" 
          placeholder="Message" 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="send-icon" onClick={handleSend}>
          <img src="../images/send-icon.svg" alt="Send" />
        </button>
      </div>
    </div>
  );
};

// --- Main Chat Pop-up Component ---
const Chat = ({ currentUserId, onClose, users }) => {
  const [currentView, setCurrentView] = useState('default'); 
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState({});

  useEffect(() => {
  if (!activeChatUser?._id) return;

  const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?receiver=${activeChatUser._id}`, { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(prev => ({
          ...prev,
          [activeChatUser._id]: data
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [activeChatUser]);

  useEffect(() => {
    if (!currentUserId) return;
    socket.connect();

    socket.emit("register", currentUserId);

    const handleReceive = (msg) => {
      const otherUserId = msg.sender._id === currentUserId ? msg.receiver._id : msg.sender._id;
      setMessages(prev => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), msg]
      }));
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [currentUserId]);

  const handleSend = (text) => {
    if (!activeChatUser || !text.trim()) return;

    const messageData = {
      sender: currentUserId,
      receiver: activeChatUser._id,
      text
    };

    socket.emit("send_message", messageData);
  };

  const activeMessages = activeChatUser ? messages[activeChatUser._id] || [] : [];

  const handleStartNewChat = () => {
    setCurrentView('new_chat');
  };

  const handleBackToDefault = () => {
    setCurrentView('default');
  };

  const handleMinimizeToggle = () => {
    setIsMinimized(prev => !prev);
  };

  useEffect(() => {
    const fetchSelectedChats = async () => {
      const res = await fetch(`/api/users/selected-chats`, {
        credentials: "include"
      });
      const data = await res.json();
      setSelectedUsers(data);
    };

    fetchSelectedChats();
  }, [currentUserId]);

  const handleStartChatWithUser = async (user) => {
    await fetch(`/api/users/selected-chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatUserId: user._id }),
      credentials: "include"
    });

    if (!selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(prev => [...prev, user]); // add user to sidebar
    }
    
    setActiveChatUser(user); // open chat window
    setCurrentView('default');
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
        onClick={handleStartNewChat}
        className="chat-main__start-button"
      >
        <img src="../images/plus.svg" alt="Plus" className="chat-main__plus-icon" />
        Start new chat
      </button>
    </div>
  );

  let MainAreaToRender;
  if (activeChatUser) {
    MainAreaToRender = (
      <ChatWindow 
        user={activeChatUser} 
        messages={activeMessages}
        onSend={handleSend}
      />
    );
  } else if (currentView === 'new_chat') {
    MainAreaToRender = (
      <NewChatForm 
        onBack={handleBackToDefault} 
        users={users} 
        onStartChat={handleStartChatWithUser} 
        currentUserId={currentUserId}
      />
    );
  } else {
    MainAreaToRender = MainContent;
  }


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
                <img src="../images/chat-1.svg" alt="New Chat" className="chat-header__icon" />
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
              {selectedUsers.length === 0 ? (
                "No recent chats."
              ) : (
                <ul className="chat-sidebar__selected-users">
                  {selectedUsers.map(u => (
                    <li key={u._id} className="chat-sidebar__user" onClick={() => setActiveChatUser(u)}>
                      <img src={u.avatar || "../images/avatar.png"} alt={u.username} />
                      <div className="chat-user-info">
                        <div className="chat-user-header">
                          <span className="chat-username">{u.username}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {MainAreaToRender}
        </div>
      </div>
    </div>
  );
};

export default Chat;