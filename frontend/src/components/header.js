import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SearchBar from "../components/searchbar";
import Chat from "../components/Chat";

function Header() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, []);

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
          console.log(data)

          if (data.avatarUrl && data.avatarUrl.startsWith('data:image')) {
            setCustomAvatar(data.avatarUrl);
          } else {
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

    const handleAvatarUpdate = () => {
      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedAvatar) {
        setCustomAvatar(savedAvatar);
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);

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

  const getAvatarUrl = () => {
    return customAvatar || "../images/avatar.png";
  };

  const profileLink = currentUser ? `/profile/${currentUser.username}` : "#";

  return (
    <>
      <div className="header">
        <a>
          <img
            src="../images/reddit-logo.png"
            className="reddit-logo"
            style={{ filter: darkMode ? 'none' : 'none' }}
          />

        </a>

        <SearchBar users={users} />

        <ul className="header-actions">

          <li className="header-action">
            <button onClick={toggleChat}>
              <div className="header-action-link">
                <img src="../images/chat.svg" />
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
                <img
                  src={getAvatarUrl()}
                  className="header-action-avatar"
                  alt="User avatar"
                  onError={(e) => {
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
                      {/* Add onChange handler and checked state */}
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                      />
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
      {isChatOpen && <Chat currentUserId={currentUser._id} onClose={() => setIsChatOpen(false)} users={users} />}
    </>
  );
}

export default Header;