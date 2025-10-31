import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import allCommunities from "../data/communitiesDB";
import Header from "../components/header"

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
      <Header />
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
                onChange={(e) => setTitle(e.target.value)} 
              />
              <textarea
                className="input-description"
                placeholder="Write your post..."
                value={content}
                onChange={(e) => setContent(e.target.value)} 
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