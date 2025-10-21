import React, { useEffect } from "react";
import { Link } from "react-router-dom";


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
                                    <a href="./create_post.html" className="header-action-link">
                                        <img src="../images/create-post.svg" /> Create
                                        <div className="header-action-tooltip">
                                            Create post
                                        </div>
                                    </a>
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
            <div className="sidebar-container">
                <div className="sidebar-container">
                    <ul className="sidebar">
                        <li>
                            <ul className="sidebar-section">
                                <li>
                                    <Link to="/" className="sidebar-link">
                                        <img src="../images/home.svg" alt="Home" />
                                        <div className="sidebar-section-item-details">
                                            Home
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <a href="" className="sidebar-link">
                                        <img src="../images/popular.svg" />
                                        <div className="sidebar-section-item-details">
                                            Popular
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a href="" className="sidebar-link">
                                        <img src="../images/all.svg" />
                                        <div className="sidebar-section-item-details">
                                            All
                                        </div>
                                    </a>
                                </li>

                            </ul>
                        </li>
                        <li>
                            <input type="checkbox" className="sidebar-collapse-checkbox"
                                id="sidebar-collapse-checkbox-custom-feeds" />
                            <label className="sidebar-collapse-label" for="sidebar-collapse-checkbox-custom-feeds"> Custom Feeds
                                <img src="../images/down.svg" />
                            </label>
                            <ul className="sidebar-section">
                                <li>
                                    <a href="" className="sidebar-link">
                                        <img src="../images/plus.svg" />
                                        <div className="sidebar-section-item-details">
                                            Create Custom Feed
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <input type="checkbox" className="sidebar-collapse-checkbox" id="sidebar-collapse-checkbox-Recent" />
                            <label className="sidebar-collapse-label" for="sidebar-collapse-checkbox-Recent"> RECENT
                                <img src="../images/down.svg" />
                            </label>
                            <ul className="sidebar-section">
                            </ul>
                        </li>
                        <li>
                            <input type="checkbox" id="sidebar-collapse-checkbox-communities" className="sidebar-collapse-checkbox" />
                            <label for="sidebar-collapse-checkbox-communities" className="sidebar-collapse-label">
                                Communities
                                <img src="../images/down.svg" />
                            </label>
                            <ul className="sidebar-section">
                                <li>
                                    <a href="#" className="sidebar-link create-community-link">
                                        <img src="../images/plus.svg" />
                                        <div className="sidebar-section-item-details">
                                            Create a community
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <Link to="/manage_community" className="sidebar-link">
                                        <img src="../images/settings.svg" />
                                        <div className="sidebar-section-item-details">
                                            Manage Community
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/community1" className="sidebar-link">
                                        <img src="../images/community-avatar1.jpg" className="sidebar-link-icon-round" alt="Community 1" />
                                        <div className="sidebar-section-item-details">
                                            <span className="community-name">r/webdev</span>
                                            <button className="make-favourite">
                                                <img src="../images/star.svg" alt="Star" />
                                            </button>
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/community2" className="sidebar-link">
                                        <img src="../images/community-avatar2.jpg" className="sidebar-link-icon-round" />
                                        <div className="sidebar-section-item-details">
                                            <span className="community-name">r/harrypotter</span>
                                            <button className="make-favourite">
                                                <img src="../images/star.svg" />
                                            </button>
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/community3" className="sidebar-link">
                                        <img src="../images/community-avatar3.jpg" className="sidebar-link-icon-round" />
                                        <div className="sidebar-section-item-details">
                                            <span className="community-name">r/playstation</span>
                                            <button className="make-favourite">
                                                <img src="../images/star.svg" />
                                            </button>
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/community4" className="sidebar-link">
                                        <img src="../images/community-avatar4.jpg" className="sidebar-link-icon-round" />
                                        <div className="sidebar-section-item-details">
                                            <span className="community-name">r/GoodCoffeeGreatCoffee</span>
                                            <button className="make-favourite">
                                                <img src="../images/star.svg" />
                                            </button>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <input type="checkbox" className="sidebar-collapse-checkbox" id="sidebar-collapse-checkbox-resources" />
                            <label className="sidebar-collapse-label" for="sidebar-collapse-checkbox-resources"> RESOURCES
                                <img src="../images/down.svg" />
                            </label>
                            <ul className="sidebar-section">
                                <li>
                                    <a href="" className="sidebar-link">
                                        <img src="../images/plus.svg" />
                                        <div className="sidebar-section-item-details">
                                            Create Community
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a href="" className="sidebar-link">
                                        <img src="../images/settings.svg" />
                                        <div className="sidebar-section-item-details">
                                            Manage Community
                                        </div>
                                    </a>
                                </li>
                            </ul>
                            <a href="" className="copyright-link">
                                Reddit, Inc. &copy;2025. All rights reserved.
                            </a>
                        </li>


                    </ul>
                </div>
            </div>
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