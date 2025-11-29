import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SearchBar from "../components/searchbar";
import Chat from "../components/Chat";

function Header() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
          
          // 🆕 Check for custom avatar in database first, then localStorage
          if (data.avatarUrl && data.avatarUrl.startsWith('data:image')) {
            setCustomAvatar(data.avatarUrl);
          } else {
            // Fallback to localStorage
            const savedAvatar = localStorage.getItem("userAvatar");
            if (savedAvatar) {
              setCustomAvatar(savedAvatar);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };

    fetchCurrentUser();

    // 🆕 Listen for avatar updates from other components
    const handleAvatarUpdate = () => {
      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedAvatar) {
        setCustomAvatar(savedAvatar);
      }
    };

    // 🆕 Custom event listener for avatar updates
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    // 🆕 Also check localStorage periodically (in case of multiple tabs)
    const interval = setInterval(() => {
      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedAvatar && savedAvatar !== customAvatar) {
        setCustomAvatar(savedAvatar);
      }
    }, 1000);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
      clearInterval(interval);
    };
  }, []);

  const toggleChat = (event) => {
    event.preventDefault();
    setIsChatOpen(prev => !prev);
  };

  // 🆕 Function to get the correct avatar URL
  const getAvatarUrl = () => {
    return customAvatar || "../images/avatar.png";
  };

  const profileLink = currentUser ? `/profile/${currentUser.username}` : "#";
  
  return (
    <>
      {/* ---------- HEADER ---------- */}
      <div className="header">
        <a>
          <img src="../images/reddit-logo.png" className="reddit-logo" />
        </a>

        <SearchBar />

        <ul className="header-actions">

          <li className="header-action">
            <button onClick={toggleChat}>
              <div className="header-action-link"> 
                <img src="../images/chat.svg" />
                <div className="message-counter">1</div>
                <div className="header-action-tooltip">Open chat</div>
              </div>
            </button>
          </li>

          <li className="header-action">
            <Link to="/create_post" className="header-action-link">
              <img src="../images/create-post.svg" />Create
              <div className="header-action-tooltip">Create post</div>
            </Link>
          </li>

          <li className="header-action">
            <button className="profile-menu-button">
              <label htmlFor="profile-menu-visibility-checkbox">
                {/* 🆕 UPDATED: Use custom avatar */}
                <img 
                  src={getAvatarUrl()} 
                  className="header-action-avatar" 
                  alt="User avatar"
                  onError={(e) => {
                    // Fallback if custom avatar fails to load
                    e.target.src = "../images/avatar.png";
                  }}
                />
              </label>
              <div className="online-indicator"></div>
              <div className="header-action-tooltip">Open profile menu</div>
            </button>
            <input type="checkbox" className="profile-menu-visibility" id="profile-menu-visibility-checkbox" />
            <ul className="profile-menu">

              <li className="profile-menu-item">
              <Link to={profileLink} className="profile-menu-link">
                <div className="profile-menu-item-icon">
                  {/* 🆕 UPDATED: Use custom avatar in profile menu too */}
                  <img
                    src={getAvatarUrl()}
                    className="profile-menu-item-icon-avatar"
                    alt="Profile avatar"
                    onError={(e) => {
                      e.target.src = "../images/avatar.png";
                    }}
                  />
                  <div className="online-indicator online-indicator-profile-menu"></div>
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">View Profile</div>
                </div>
              </Link>
            </li>

            <li className="profile-menu-item">
              <Link to="/edit-avatar" className="profile-menu-link">
                <div className="profile-menu-item-icon">
                  <img src="../images/edit-avatar.svg" alt="Edit avatar icon" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">Edit Avatar</div>
                </div>
              </Link>
            </li>

              <li className="profile-menu-item">
                <div className="profile-menu-link">
                  <div className="profile-menu-item-icon">
                    <img src="../images/dark-mode.svg" />
                  </div>
                  <div className="profile-menu-item-info">
                    <div className="profile-menu-item-title">Dark Mode</div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </li>

              <li className="profile-menu-item">
                <Link to="/" className="profile-menu-link">
                  <div className="profile-menu-item-icon">
                    <img src="../images/logout.svg" alt="Logout icon" />
                  </div>
                  <div className="profile-menu-item-info">
                    <div className="profile-menu-item-title">Log Out</div>
                  </div>
                </Link>
              </li>
              
            </ul>
          </li>
        </ul>
      </div>
      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />} 
    </>
)};

export default Header;