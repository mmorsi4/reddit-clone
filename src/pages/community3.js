import React from "react";
import { Link } from "react-router-dom";
import Post from "./post";
import CommunityHeader from "./communityHeader";
import SearchBar from "./searchbar";





function Community3() {
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
                <CommunityHeader
                    banner="../images/community-banner3.png"
                    avatar="../images/community-avatar3.jpg"
                    name="playstation"
                />
                <div className="main-body">
                    <div className="main-posts">
                        <div className="post-container">
                            <div className="post">
                                <Post
                                    username="QuinnHannan1"
                                    time="5 days ago"
                                    title="I fired a great dev and wasted $50,000"
                                    textPreview="I almost killed my startup before it even launched..."
                                    avatar="../images/avatar.png"
                                    initialVotes={443}
                                    initialComments={[
                                        { username: "techguru", text: "Oof, that sounds rough!" },
                                        { username: "startuplife", text: "Been there. Lessons learned!" },]}
                                />

                                <Post
                                    username="deathsowhat"
                                    time="1 day ago"
                                    title="I found the final boss guys"
                                    preview="../images/preview-9.jpg"
                                    avatar="../images/avatar-2.png"
                                    initialVotes={43}
                                    initialComments={[
                                        { username: "gamerchick", text: "LOL that’s hilarious" },
                                    ]}
                                />


                                <Post
                                    username="_Maximum"
                                    time="3 days ago"
                                    title="Click to cancel, now with more gamification"
                                    preview="../images/preview-3.gif"
                                    avatar="../images/avatar-7.png"
                                    initialVotes={563}
                                    initialComments={[
                                        { username: "uxfan", text: "That’s so true 😂" },
                                        { username: "maximillion", text: "Great post!" },
                                    ]}
                                />

                            </div>
                        </div>
                    </div>
                </div>
                <div className="main-sidebar">
                    <div className="main-sidebar-community-info">
                        <div className="main-sidebar-description">
                            <h2 className="main-sidebar-description-title">
                                The Great Hall
                            </h2>
                            <div className="main-sidebar-description-detailed">
                                Welcome to r/HarryPotter, the place where fans from around the world can meet and discuss everything in the Harry Potter universe! Be sorted, earn house points, debate which actor portrayed Dumbledore the best and finally get some closure for your Post-Potter Depression.
                            </div>
                        </div>
                        <div className="main-sidebar-community-stats">
                            <div className="main-sidebar-stats-overall">
                                <div className="main-sidebar-stats-amount">1.1M</div>
                                <div className="main-sidebar-stats-label">Witches & Wizards</div>
                            </div>
                            <div className="main-sidebar-stats-overall">
                                <div className="main-sidebar-stats-amount">486</div>
                                <div className="main-sidebar-stats-label">
                                    <div className="main-sidebar-online-dot"></div>
                                    Online
                                </div>
                            </div>
                            <div className="main-sidebar-stats-overall">
                                <div className="main-sidebar-stats-amount">Top 1%</div>
                                <div className="main-sidebar-stats-label">Rank by size</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Community3;