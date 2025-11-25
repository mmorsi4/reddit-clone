import React, { useState } from "react";
import "../styles/create_community.css";

function CreateCommunityPopup({ onClose, onCreate }) {
  const AVATAR_MAX_WIDTH = 200;
  const AVATAR_MAX_HEIGHT = 200;
  const BANNER_MAX_WIDTH = 1200;
  const BANNER_MAX_HEIGHT = 300;

  const [step, setStep] = useState(1);
  const allTopics = [
    "Technology", "Gaming", "Art", "Music", "Movies", "Coding", 
    "Cooking", "Books", "Travel", "Fitness", "Fashion", "Science",
  ];
  const [search, setSearch] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else if (selectedTopics.length < 3) {
      setSelectedTopics([...selectedTopics, topic]);
    } else {
      alert("You can only select up to 3 topics");
    }
  };

  const handleFileChange = (e, setter, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
      img.onload = () => {
        if (type === "avatar") {
          if (img.width > AVATAR_MAX_WIDTH || img.height > AVATAR_MAX_HEIGHT) {
            alert("Avatar too large! Please choose one up to 200x200px.");
            e.target.value = "";
            return;
          }
        } else if (type === "banner") {
          if (img.width > BANNER_MAX_WIDTH || img.height > BANNER_MAX_HEIGHT) {
            alert("Banner too large! Please choose one up to 1200x300px.");
            e.target.value = "";
            return;
          }
        }
        setter(event.target.result);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a community name");
      return;
    }

    try {
      const res = await fetch("/api/communities/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          title: name.trim(),
          description,
          avatar,
          banner,
          topics: selectedTopics,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create community");
      }

      const newCommunity = await res.json();
      window.dispatchEvent(new Event("customCommunityUpdated"));
      onCreate(newCommunity);
      onClose();
      alert("Community created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const filteredTopics = allTopics.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="popup-overlay">
      <div className="popup">
        {step === 1 && (
          <>
            <h2 className="topic-step-title">Add Topics</h2>
            <p className="topic-step-subtitle">
              Select up to 3 topics that best describe your community.
            </p>
            <input
              type="text"
              className="topic-step-search"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="topic-step-list">
              {filteredTopics.map((topic) => (
                <button
                  key={topic}
                  className={`topic-step-btn ${selectedTopics.includes(topic) ? "selected" : ""}`}
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
            <p className="topic-step-count">
              {selectedTopics.length}/3 selected
            </p>
            <div className="topic-step-buttons">
              <button className="topic-step-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="topic-step-btn-primary" onClick={() => setStep(2)}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="details-step-title">Tell us about your community</h2>
            <p className="details-step-subtitle">
              A name and description help people understand what your community is about.
            </p>
            
            <div className="details-form">
              <div className="form-group">
                <label className="form-label">Community Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  placeholder="Enter community name"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your community"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                />
              </div>
            </div>

            <div className="popup-buttons">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Style your community</h2>
            <p>Add a banner and icon to make it unique!</p>

            <div className="style-form">
              <div className="form-group">
                <label className="form-label">Upload Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setAvatar, "avatar")}
                />
                {avatar && <img src={avatar} alt="Avatar preview" className="preview-img" />}
              </div>

              <div className="form-group">
                <label className="form-label">Upload Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setBanner, "banner")} 
                />
                {banner && <img src={banner} alt="Banner preview" className="preview-img" />}
              </div>
            </div>

            <div className="popup-buttons">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                Create Community
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateCommunityPopup;