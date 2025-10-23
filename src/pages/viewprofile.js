import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./searchbar";
import Sidebar from "./sidebar";



function ViewProfile() {
  useEffect(() => {
    // 🧠 Get current user data
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const savedAvatar = localStorage.getItem("userAvatar");

    const avatarEl = document.getElementById("profile-avatar");
    const nameEl = document.getElementById("profile-name");
    const usernameEl = document.getElementById("profile-username");
    const emptyTextEl = document.getElementById("empty-text");

    if (user) {
      nameEl.textContent = user.username;
      usernameEl.textContent = `u/${user.username}`;
      emptyTextEl.textContent = `u/${user.username} hasn't posted yet`;
    }

    // 🧩 If saved avatar exists, load it
    if (savedAvatar) {
      avatarEl.src = savedAvatar;
    }
  }, []);
  return (

    <>
       <div className="header">
        <a>
          <img src="../images/reddit-logo.png" className="reddit-logo" />
        </a>

        <SearchBar />

        <ul className="header-actions">
          <li className="header-action">
            <button>
              <img src="../images/ads.svg" />
              <div className="header-action-tooltip">
                Advertise on Reddit
              </div>
            </button>
          </li>
          <li className="header-action">
            <button>
              <a href="./chats.html" className="header-action-link">
                <img src="../images/chat.svg" />
                <div className="header-action-tooltip">
                  Open chat
                </div>
              </a>
            </button>
          </li>
          <li className="header-action">
            <Link to ="/create_post" className="header-action-link">
              <img src="../images/create-post.svg" /> Create
              <div className="header-action-tooltip">
                Create post
              </div>
            </Link>
          </li>
          <li className="header-action">
            <button className="inbox-button">
              <img src="../images/open-inbox.svg" />
              <div className="notification-counter">1</div>
              <div className="header-action-tooltip">
                Open inbox
              </div>
            </button>
          </li>
          <li className="header-action">
            <button className="profile-menu-button">
              <label for="profile-menu-visibility-checkbox">
                <img src="../images/avatar.png" className="header-action-avatar" />
              </label>
              <div className="online-indicator"></div>
              <div className="header-action-tooltip">
                Open profile menu
              </div>
            </button>
            <input type="checkbox" className="profile-menu-visibility" id="profile-menu-visibility-checkbox" />
            <ul className="profile-menu">
              <li className="profile-menu-item">
                <Link to="/viewprofile" className="header-action-link">
                  <div className="profile-menu-item-left">
                    <img src="../images/avatar.png"
                      className="profile-menu-item-icon profile-menu-item-icon-avatar" />
                    <div className="online-indicator online-indicator-profile-menu"></div>
                  </div>
                  <div className="profile-menu-item-right">
                    <div className="profile-menu-item-title">
                      View Profile
                    </div>
                    <div className="profile-menu-item-info-extra">

                    </div>
                  </div>
                </Link>
              </li>
              <li className="profile-menu-item">
                <Link to="/edit-avatar" className="header-action-link">
                  <div className="profile-menu-item-icon">
                    <img src="../images/edit-avatar.svg" />
                  </div>
                  <div className="profile-menu-item-info">
                    <div className="profile-menu-item-title">
                      Edit Avatar
                    </div>
                  </div>
                </Link>
              </li>
              <li className="profile-menu-item">
                <div className="profile-menu-item-icon">
                  <img src="../images/achievements.svg" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">
                    Achievements
                  </div>
                  <div className="profile-menu-item-info-extra">
                    3 unlocked
                  </div>
                </div>
              </li>
              <li className="profile-menu-item">
                <div className="profile-menu-item-icon">
                  <img src="../images/dark-mode.svg" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">
                    Dark Mode
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </li>
              <li className="profile-menu-item" style={{ cursor: "pointer" }}>
                <Link to="/login" className="profile-menu-link">
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
      <Sidebar/>
      <div className="main">
        <div className="profile-header">
          <img
            id="profile-avatar"
            src="../images/default-avatar.png"
            alt="Avatar"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2 id="profile-name" className="profile-name">
              Username
            </h2>
            <p id="profile-username" className="profile-username">
              u/username
            </p>
          </div>
        </div>

        <div className="profile-tabs">
          <button className="tab active">Overview</button>
          <button className="tab">Posts</button>
          <button className="tab">Comments</button>
          <button className="tab">Saved</button>
          <button className="tab">History</button>
          <button className="tab">Hidden</button>
          <button className="tab">Upvoted</button>
          <button className="tab">Downvoted</button>
        </div>

        <div className="profile-content">
          <div className="showing-content">
            <span>Showing all content</span>
          </div>

          <div className="create-post">
            <button className="create-post-btn">+ Create Post</button>
            <select className="sort-select">
              <option>New</option>
              <option>Top</option>
              <option>Hot</option>
            </select>
          </div>

          <div className="empty-state">
            <p className="empty-text" id="empty-text">
              User hasn’t posted yet
            </p>
          </div>
        </div>
      </div>

    </>
  );
}
export default ViewProfile;