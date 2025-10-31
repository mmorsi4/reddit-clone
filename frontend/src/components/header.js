import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SearchBar from "../components/searchbar";

function Header() {return (
    <>
      {/* ---------- HEADER ---------- */}
      <div className="header">
        <a>
          <img src="../images/reddit-logo.png" className="reddit-logo" />
        </a>

        <SearchBar />

        <ul className="header-actions">

          <li className="header-action">
            <button>
              <a href="./chats.html" className="header-action-link">
                <img src="../images/chat.svg" />
                <div className="message-counter">1</div>
                <div className="header-action-tooltip">Open chat</div>
              </a>
            </button>
          </li>

          <li className="header-action">
            <Link to="/create_post" className="header-action-link rect">
              <img src="../images/create-post.svg" /> Create
              <div className="header-action-tooltip">Create post</div>
            </Link>
          </li>

          <li className="header-action">
            <button className="profile-menu-button">
              <label htmlFor="profile-menu-visibility-checkbox">
                <img src="../images/avatar.png" className="header-action-avatar" />
              </label>
              <div className="online-indicator"></div>
              <div className="header-action-tooltip">Open profile menu</div>
            </button>
            <input type="checkbox" className="profile-menu-visibility" id="profile-menu-visibility-checkbox" />
            <ul className="profile-menu">

              <li className="profile-menu-item">
              <Link to="/viewprofile" className="profile-menu-link">
                <div className="profile-menu-item-icon">
                  <img
                    src="../images/avatar.png"
                    className="profile-menu-item-icon-avatar"
                    alt="Profile avatar"
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
      </>
)};

export default Header;