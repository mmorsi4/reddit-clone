import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import SearchBar from "./searchbar";
import Sidebar from "./sidebar";
import allCommunities from "../data/communitiesDB";

function CreatePost() {
  const [postType, setPostType] = useState("text");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const navigate = useNavigate(); // ✅ added navigation after posting

  const handleTypeSwitch = (type) => setPostType(type);

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community);
    setIsDropdownOpen(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // ✅ Fixed: Save Draft button now works
  const handleSaveDraft = () => {
    const draft = { title, content, selectedCommunity, postType, selectedFiles };
    localStorage.setItem("draft_post", JSON.stringify(draft));
    alert("Draft saved!");
  };

  // ✅ Fixed: Post button adds post to the selected community
  const handlePost = () => {
    if (!title.trim()) {
      alert("Please add a title before posting!");
      return;
    }
    if (!selectedCommunity) {
      alert("Please select a community before posting!");
      return;
    }

    const communityKey = `posts_${selectedCommunity.name}`; // dynamic key per community

    const newPost = {
      username: "Mai", // change later when login system ready
      time: "Just now",
      title,
      textPreview:
        postType === "text"
          ? content
          : postType === "link"
          ? content
          : selectedFiles.length > 0
          ? `Uploaded ${selectedFiles.length} file(s)`
          : "",
      avatar: "../images/avatar.png",
      initialVotes: 0,
      initialComments: [],
    };

    const existingPosts = JSON.parse(localStorage.getItem(communityKey)) || [];
    const updatedPosts = [newPost, ...existingPosts];
    localStorage.setItem(communityKey, JSON.stringify(updatedPosts));

    alert(`Post added to r/${selectedCommunity.name}!`);
    navigate(`/community1`); // ✅ redirect back to the community page
  };

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <a>
          <img src="../images/reddit-logo.png" className="reddit-logo" alt="Reddit Logo" />
        </a>

        <SearchBar />

        <ul className="header-actions">
          <li className="header-action">
            <button>
              <img src="../images/ads.svg" alt="Ads" />
              <div className="header-action-tooltip">Advertise on Reddit</div>
            </button>
          </li>

          <li className="header-action">
            <button>
              <a href="./chats.html" className="header-action-link">
                <img src="../images/chat.svg" alt="Chat" />
                <div className="header-action-tooltip">Open chat</div>
              </a>
            </button>
          </li>

          <li className="header-action">
            <Link to="/create_post" className="header-action-link">
              <img src="../images/create-post.svg" alt="Create" /> Create
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
                    <img src="../images/edit-avatar.svg" alt="Edit" />
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
                  <img src="../images/dark-mode.svg" alt="Dark mode" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">Dark Mode</div>
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

      <Sidebar />

      {/* MAIN */}
      <div className="main">
        <label className="create-label">Create post</label>

        {/* Community Dropdown */}
        <div className="community-select">
          <label htmlFor="community" className="community-label">
            Select a community
          </label>

          <div
            className={`custom-community-dropdown ${isDropdownOpen ? "open" : ""}`}
            id="communityDropdown"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="custom-selected">
              {selectedCommunity ? (
                <div className="custom-selected-content">
                  <img
                    src={selectedCommunity.image}
                    alt={selectedCommunity.name}
                    className="custom-avatar"
                  />
                  r/{selectedCommunity.name}
                </div>
              ) : (
                "-- Choose a community --"
              )}
            </div>

            {isDropdownOpen && (
              <ul className="custom-dropdown-list">
                {allCommunities.map((community, index) => (
                  <li
                    key={index}
                    className="custom-dropdown-item"
                    onClick={() => handleSelectCommunity(community)}
                  >
                    <img
                      src={community.image}
                      alt={community.name}
                      className="custom-avatar"
                    />
                    r/{community.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Post Type Buttons */}
        <div className="post-type-select">
          <button
            className={`type-btn ${postType === "text" ? "active" : ""}`}
            onClick={() => handleTypeSwitch("text")}
          >
            Text
          </button>
          <button
            className={`type-btn ${postType === "media" ? "active" : ""}`}
            onClick={() => handleTypeSwitch("media")}
          >
            Images & Video
          </button>
          <button
            className={`type-btn ${postType === "link" ? "active" : ""}`}
            onClick={() => handleTypeSwitch("link")}
          >
            Link
          </button>
        </div>

        {/* Post Form */}
        <div id="post-form">
          {postType === "text" && (
            <div className="post-section text-section">
              <input
                type="text"
                className="input-title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)} // ✅ bind title
              />
              <textarea
                className="input-description"
                placeholder="Write your post..."
                value={content}
                onChange={(e) => setContent(e.target.value)} // ✅ bind content
              ></textarea>
            </div>
          )}

          {postType === "media" && (
            <div className="post-section media-section">
              <input
                type="text"
                className="input-title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div
                className="upload-box"
                id="uploadBox"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <p>
                  Drag & drop images or videos here, or{" "}
                  <span
                    className="upload-text"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("fileInput").click();
                    }}
                  >
                    browse
                  </span>
                </p>
                {selectedFiles.length > 0 && (
                  <ul className="selected-files">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                )}
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*,video/*"
                  multiple
                  hidden
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          {postType === "link" && (
            <div className="post-section link-section">
              <input
                type="text"
                className="input-title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="url"
                className="input-link"
                placeholder="Paste your link URL"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="post-actions">
          <button className="btn-secondary" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button className="btn-primary" id="postBtn" onClick={handlePost}>
            Post
          </button>
        </div>
      </div>
    </>
  );
}

export default CreatePost;