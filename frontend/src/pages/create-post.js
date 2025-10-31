import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Sidebar from "../components/sidebar";

function CreatePost() {
  const [postType, setPostType] = useState("text");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [communities, setCommunities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const res = await fetch("/api/communities");
        if (!res.ok) throw new Error("Failed to load communities");
        const data = await res.json();
        setCommunities(data);
      } catch {
        alert("Network error while loading communities");
      }
    };
    loadCommunities();
  }, []);

  const handleTypeSwitch = (type) => {
    setPostType(type);
    setErrors({});
  };

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community);
    setIsDropdownOpen(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedCommunity) newErrors.community = "Please select a community.";
    if (!title.trim()) newErrors.title = "Title is required.";
    if (postType === "link" && !content.trim())
      newErrors.link = "Link URL is required.";
    if (postType === "media" && selectedFiles.length === 0)
      newErrors.media = "Please upload at least one image or video.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
    if (!validate()) return;

    try {
      const postData = {
        title,
        community: selectedCommunity._id || selectedCommunity.name,
      };

      if (postType === "text") postData.body = content;
      if (postType === "link") postData.url = content;
      if (postType === "media")
        postData.url = "https://example.com/fake-media-link"; // placeholder

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(postData),
        credentials: "include"
      });

      if (!res.ok) {
        const errText = await res.text();
        console.log(errText);
        throw new Error(errText || "Failed to create post");
      }

      const newPost = await res.json();
      console.log("Post created:", newPost);

      alert("Posted successfully!")
      navigate(`/community/${selectedCommunity.name}`);
    } catch (err) {
      console.log("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  const isPostDisabled = () => {
    if (!selectedCommunity) return true;
    if (!title.trim()) return true;
    if (postType === "link" && !content.trim()) return true;
    if (postType === "media" && selectedFiles.length === 0) return true;
    return false;
  };

  return (
    <>
      <Header />
      <Sidebar />

      <div className="main create-post-page">
        <h2 className="create-title">Create Post</h2>

        {/* COMMUNITY PICKER */}
        <div className="community-picker">
          <div
            className={`community-select-box ${errors.community ? "input-error" : ""}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>
              {selectedCommunity ? `r/${selectedCommunity.name}` : "Choose a community"}
            </span>
          </div>
          {errors.community && <p className="error-msg">{errors.community}</p>}

          {isDropdownOpen && (
            <ul className="community-dropdown">
              {communities.map((c, i) => (
                <li
                  key={i}
                  className="community-item"
                  onClick={() => handleSelectCommunity(c)}
                >
                  <img src={c.avatar} alt={c.name} className="community-avatar" />
                  <span>r/{c.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* POST TYPE TABS */}
        <div className="post-type-tabs">
          {["text", "media", "link"].map((type) => (
            <button
              key={type}
              className={`tab-btn ${postType === type ? "active" : ""}`}
              onClick={() => handleTypeSwitch(type)}
            >
              {type === "media" ? "Images & Video" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* FORM */}
        <div className="post-body">
          {/* TEXT POST */}
          {postType === "text" && (
            <>
              <label className="input-label">
                Title<span className="required">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.title ? "input-error" : ""}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <p className="error-msg">{errors.title}</p>}

              <label className="input-label">Body text (optional)</label>
              <textarea
                className="input-field input-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </>
          )}

          {/* MEDIA POST */}
          {postType === "media" && (
            <>
              <label className="input-label">
                Title<span className="required">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.title ? "input-error" : ""}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <p className="error-msg">{errors.title}</p>}

              <label className="input-label">Upload Files<span className="required">*</span></label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <ul className="selected-files">
                  {selectedFiles.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
              {errors.media && <p className="error-msg">{errors.media}</p>}
            </>
          )}

          {/* LINK POST */}
          {postType === "link" && (
            <>
              <label className="input-label">
                Title<span className="required">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.title ? "input-error" : ""}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <p className="error-msg">{errors.title}</p>}

              <label className="input-label">
                Link URL<span className="required">*</span>
              </label>
              <input
                type="url"
                className={`input-field ${errors.link ? "input-error" : ""}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {errors.link && <p className="error-msg">{errors.link}</p>}
            </>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="action-row">
          <button
            className={`btn-post ${isPostDisabled() ? "disabled" : ""}`}
            disabled={isPostDisabled()}
            onClick={handlePost}
          >
            Post
          </button>
        </div>
      </div>
    </>
  );
}

export default CreatePost;