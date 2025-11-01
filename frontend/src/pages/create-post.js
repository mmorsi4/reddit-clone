import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/header";
import Sidebar from "../components/sidebar";

function CreatePost({ showToast }) {
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
      const res = await fetch("/api/communities/", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load communities");
      const data = await res.json();
      setCommunities(data);
    } catch {
      alert("Network error while loading communities");
    }
  };
  loadCommunities();
}, []);

  const location = useLocation();
  console.log(location);

  const query = new URLSearchParams(location.search);
  const preselectedCommunityName = query.get("community");

  useEffect(() => {
    if (preselectedCommunityName && communities.length > 0) {
      const community = communities.find(c => c.name === preselectedCommunityName);
      if (community) setSelectedCommunity(community);
    }
  }, [preselectedCommunityName, communities]);

  const handleTypeSwitch = (type) => {
    setPostType(type);
    setErrors({});
  };

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community);
    setIsDropdownOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFiles([file]); // store as single-item array
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
      const formData = new FormData();
      formData.append("title", title);
      formData.append("community", selectedCommunity._id || selectedCommunity.name);

      if (postType === "text") formData.append("body", content);
      if (postType === "link") formData.append("url", content);
      if (postType === "media" && selectedFiles[0]) {
        formData.append("file", selectedFiles[0]); // actual File object
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData, // dont set content-type manually or media wont uplaod to backend
        credentials: "include"
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create post");
      }

      showToast("Post created successfully!");
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
                  <img src={c.avatar} alt={c.name} className="create-community-avatar" />
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

              <div className="media-upload">
                <label className="dropzone">
                  <span className="plus-icon">+</span>
                  <p>{selectedFiles.length === 0 ? "Drag & drop an image or video here, or click to upload" : "Replace file"}</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="file-preview">
                    {selectedFiles[0].type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(selectedFiles[0])}
                        alt="preview"
                        className="preview-media"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(selectedFiles[0])}
                        controls
                        className="preview-media"
                      />
                    )}
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => setSelectedFiles([])}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

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