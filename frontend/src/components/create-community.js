import React, { useState } from "react";
import "../styles/create_community.css";

function CreateCommunityPopup({ onClose, onCreate }) {
  // Define allowed dimensions
  const AVATAR_MAX_WIDTH = 200;
  const AVATAR_MAX_HEIGHT = 200;
  const BANNER_MAX_WIDTH = 1200;
  const BANNER_MAX_HEIGHT = 300;



  const [step, setStep] = useState(1);

  // Step 1: Topics
  const allTopics = [
    "Technology",
    "Gaming",
    "Art",
    "Music",
    "Movies",
    "Coding",
    "Cooking",
    "Books",
    "Travel",
    "Fitness",
    "Fashion",
    "Science",
  ];
  const [search, setSearch] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Step 2: Privacy Type
  const [communityType, setCommunityType] = useState("public");

  // Step 3: Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Step 4: Style
  const [banner, setBanner] = useState(null);
  const [avatar, setAvatar] = useState(null);
  // Handle topic select
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
        // Validate size depending on type
        if (type === "avatar") {
          if (img.width > AVATAR_MAX_WIDTH || img.height > AVATAR_MAX_HEIGHT) {
            alert(`❌ Avatar too large! Please choose one up to ${AVATAR_MAX_WIDTH}x${AVATAR_MAX_HEIGHT}px.`);
            e.target.value = ""; // reset file input
            return;
          }
        } else if (type === "banner") {
          if (img.width > BANNER_MAX_WIDTH || img.height > BANNER_MAX_HEIGHT) {
            alert(`❌ Banner too large! Please choose one up to ${BANNER_MAX_WIDTH}x${BANNER_MAX_HEIGHT}px.`);
            e.target.value = "";
            return;
          }
        }

        // If valid, set image preview
        setter(event.target.result);
      };
    };

    reader.readAsDataURL(file);
  };
  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter a community name");
      return;
    }

    const newCommunity = {
      name: name.trim(),
      description,
      topics: selectedTopics,
      type: communityType,
      banner,
      avatar,
      link: `/community/${name.trim()}`,
    };

    const stored = JSON.parse(localStorage.getItem("customCommunities")) || [];
    stored.push(newCommunity);
    localStorage.setItem("customCommunities", JSON.stringify(stored));

    window.dispatchEvent(new Event("customCommunityUpdated"));
    onCreate(newCommunity);
    onClose();
  };

  // Filter topics
  const filteredTopics = allTopics.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="popup-overlay">
      <div className="popup">
        {/* Step 1: Choose Topics */}
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
                  className={`topic-step-btn ${selectedTopics.includes(topic) ? "selected" : ""
                    }`}
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

        {/* Step 2: Community Type */}
        {step === 2 && (
          <>
            <h2>What kind of community is this?</h2>
            <p>
              Decide who can view and contribute. Only public communities show up in search.
            </p>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="public"
                  checked={communityType === "public"}
                  onChange={(e) => setCommunityType(e.target.value)}
                />
                <strong>Public:</strong> Anyone can view, post, and comment.
              </label>
              <label>
                <input
                  type="radio"
                  value="restricted"
                  checked={communityType === "restricted"}
                  onChange={(e) => setCommunityType(e.target.value)}
                />
                <strong>Restricted:</strong> Anyone can view, only approved users can contribute.
              </label>
              <label>
                <input
                  type="radio"
                  value="private"
                  checked={communityType === "private"}
                  onChange={(e) => setCommunityType(e.target.value)}
                />
                <strong>Private:</strong> Only approved users can view and contribute.
              </label>
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

        {/* Step 3: Details */}
        {step === 3 && (
          <>
            <h2>Tell us about your community</h2>
            <p>A name and description help people understand what your community is about.</p>
            <label>Community Name *</label>
            <input
              type="text"
              value={name}
              placeholder="Enter community name"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label>Description *</label>
            <textarea
              placeholder="Describe your community"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="popup-buttons">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => setStep(4)}>
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 4: Style */}
        {step === 4 && (
          <>
            <h2>Style your community</h2>
            <p>Add a banner and icon to make it unique!</p>

            <label>Upload Avatar</label>
            <label>Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setAvatar, "avatar")}
            />
            {avatar && <img src={avatar} alt="Avatar preview" className="preview-img" />}

            <label>Upload Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setAvatar, "avatar")}
            />
            {avatar && <img src={avatar} alt="Avatar preview" className="preview-img" />}

            <div className="popup-buttons">
              <button className="btn-secondary" onClick={() => setStep(3)}>
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