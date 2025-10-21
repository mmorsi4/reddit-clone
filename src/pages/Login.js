import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css"

function Login() {
  const [activeForm, setActiveForm] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Login successful!");
    navigate("/");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    alert("Account created successfully! Redirecting to Login...");
    setTimeout(() => navigate("/login"), 1500);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <Link to="/">
          <img src="../images/reddit-logo.png" className="reddit-logo" alt="Reddit Logo" />
        </Link>

        <div className="search">
          <img src="../images/search.svg" />
          <input type="text" placeholder="Search Reddit" className="search-input" />
          <div className="search-results">
            <div className="search-results-scrollable">
              <ul className="recent-searches">
                <li>
                  <img src="../images/community1.png" className="community-image" />
                  <div className="recent-search-value">r/sims4</div>
                  <button className="remove">
                    <img src="../images/close.svg" />
                  </button>
                </li>
                <li>
                  <img src="../images/community2.png" className="community-image" />
                  <div className="recent-search-value">r/egyOutfits</div>
                  <button className="remove">
                    <img src="../images/close.svg" />
                  </button>
                </li>
                <li>
                  <img src="../images/community3.png" className="community-image" />
                  <div className="recent-search-value">r/GoodCoffeeGreatCoffee</div>
                  <button className="remove">
                    <img src="../images/close.svg" />
                  </button>
                </li>
              </ul>
              <div className="trending-today">
              </div>
            </div>
          </div>
        </div>

        <ul className="header-actions">
          <li className="header-action">
            <button>
              <img src="../images/ads.svg" alt="Ads" />
              <div className="header-action-tooltip">Advertise on Reddit</div>
            </button>
          </li>

          <li className="header-action">
            <button>
              <Link to="/chats" className="header-action-link">
                <img src="../images/chat.svg" alt="Chat" />
                <div className="header-action-tooltip">Open chat</div>
              </Link>
            </button>
          </li>

          <li className="header-action">
            <Link to="/create-post" className="header-action-link">
              <img src="../images/create-post.svg" alt="Create Post" /> Create
              <div className="header-action-tooltip">Create post</div>
            </Link>
          </li>

          <li className="header-action">
            <button className="inbox-button">
              <img src="../images/open-inbox.svg" alt="Inbox" />
              <div className="notification-counter">1</div>
              <div className="header-action-tooltip">Open inbox</div>
            </button>
          </li>

          <li className="header-action">
            <button className="profile-menu-button">
              <label htmlFor="profile-menu-visibility-checkbox">
                <img src="../images/avatar.png" className="header-action-avatar" alt="Avatar" />
              </label>
              <div className="online-indicator"></div>
              <div className="header-action-tooltip">Open profile menu</div>
            </button>

            <input
              type="checkbox"
              className="profile-menu-visibility"
              id="profile-menu-visibility-checkbox"
            />

            <ul className="profile-menu">
              <li className="profile-menu-item">
                <Link to="/viewprofile" className="header-action-link">
                  <div className="profile-menu-item-left">
                    <img
                      src="../images/avatar.png"
                      className="profile-menu-item-icon profile-menu-item-icon-avatar"
                      alt="Profile Avatar"
                    />
                    <div className="online-indicator online-indicator-profile-menu"></div>
                  </div>
                  <div className="profile-menu-item-right">
                    <div className="profile-menu-item-title">View Profile</div>
                  </div>
                </Link>
              </li>

              <li className="profile-menu-item">
                <Link to="/edit-avatar" className="header-action-link">
                  <div className="profile-menu-item-icon">
                    <img src="../images/edit-avatar.svg" alt="Edit Avatar" />
                  </div>
                  <div className="profile-menu-item-info">
                    <div className="profile-menu-item-title">Edit Avatar</div>
                  </div>
                </Link>
              </li>

              <li className="profile-menu-item">
                <div className="profile-menu-item-icon">
                  <img src="../images/achievements.svg" alt="Achievements" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">Achievements</div>
                  <div className="profile-menu-item-info-extra">3 unlocked</div>
                </div>
              </li>

              <li className="profile-menu-item">
                <div className="profile-menu-item-icon">
                  <img src="../images/dark-mode.svg" alt="Dark Mode" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">Dark Mode</div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </li>

              <li
                className="profile-menu-item"
                onClick={() => (window.location.href = "/login")}
                style={{ cursor: "pointer" }}
              >
                <div className="profile-menu-item-icon">
                  <img src="../images/logout.svg" alt="Logout" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">Log Out</div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {/* AUTH BOX */}
      <div className="login-container">
        <div className="login-box">
          <div className="login-tabs">
            <button
              className={`login-tab ${activeForm === "login" ? "active" : ""}`}
              onClick={() => setActiveForm("login")}
            >
              Login
            </button>
            <button
              className={`login-tab ${activeForm === "signup" ? "active" : ""}`}
              onClick={() => setActiveForm("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* 🟢 Login Form */}
          {activeForm === "login" && (
            <form
              className={`login-form ${activeForm === "login" ? "login-active" : ""}`}
              id="login-form"
              onSubmit={handleLogin}
            >
              <h2>Welcome Back!</h2>
              <input
                id="login-username-email"
                type="text"
                placeholder="Username or Email"
                required
              />
              <div className="login-password-field">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                />
                <img
                  src={showPassword ? "../images/eye-off.svg" : "../images/eye.svg"}
                  alt="Toggle password visibility"
                  className="login-toggle-password"
                  onClick={togglePassword}
                  style={{ cursor: "pointer" }}
                />              </div>
              <button type="submit" className="login-btn">Login</button>
              <p className="login-switch-text">
                Don’t have an account?{" "}
                <span onClick={() => setActiveForm("signup")}>Sign up</span>
              </p>
            </form>
          )}

          {/* 🟣 Signup Form */}
          {activeForm === "signup" && (
            <form
              className={`login-form ${activeForm === "signup" ? "login-active" : ""}`}
              id="signup-form"
              onSubmit={handleSignup}
            >
              <h2>Create an Account</h2>
              <input id="signup-username" type="text" placeholder="Username" required />
              <input id="signup-email" type="email" placeholder="Email" required />
              <div className="login-password-field">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                />
                <img
                  src={showPassword ? "../images/eye-off.svg" : "../images/eye.svg"}
                  alt="Toggle password visibility"
                  className="login-toggle-password"
                  onClick={togglePassword}
                  style={{ cursor: "pointer" }}
                />              </div>
              <button type="submit" className="login-btn">Sign Up</button>
              <p className="login-switch-text">
                Already have an account?{" "}
                <span onClick={() => setActiveForm("login")}>Login</span>
              </p>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}

export default Login;