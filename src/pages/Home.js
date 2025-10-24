import "../styles/header.css";
import "../styles/search.css";
import "../styles/main.css";
import "../styles/sidebar.css";
import "../styles/main-sidebar.css";
import "../styles/community.css";
import "../styles/main-posts.css";
import "../styles/viewprofile.css";
import "../styles/manage.css";
import "../styles/create_post.css";
import "../styles/edit_avatar.css";
import "../styles/create_community.css";
import { Link } from "react-router-dom";
import Post from "../components/post";
import SearchBar from "../components/searchbar";
import Sidebar from "../components/sidebar";


function Home() {

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
        <div className="main-head">
          <div className="content-body">
            <div className="content-main">
              <div className="post-list">
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
      </div>
    </>
  );
}

export default Home;
