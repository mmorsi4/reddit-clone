import React, { useState, useEffect } from "react";


function CommunityHeader({ banner, avatar, name }) {
  const storageKey = `joined_${name}`; // unique key per community
const [joined, setJoined] = useState(false);

// ✅ Load from localStorage when component loads
useEffect(() => {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.joined) setJoined(true);
    } catch {
      // for backward compatibility (old "true"/"false" values)
      if (saved === "true") setJoined(true);
    }
  }
}, [storageKey]);

// ✅ Handle join / unjoin
const handleJoin = () => {
  const newState = !joined;
  setJoined(newState);

  const dataToSave = {
    joined: newState,
    avatar: avatar,   // ✅ save avatar dynamically
    banner: banner,   // optional — store banner too
  };

  localStorage.setItem(storageKey, JSON.stringify(dataToSave));
};

  return (
    <div className="main-head">
      <img src={banner} className="main-head-banner" alt="community banner" />

      <div className="main-head-info">
        <div className="main-head-community">
          <img src={avatar} className="community-avatar" alt="community avatar" />
          <h1>r/{name}</h1>
        </div>

        <div className="community-actions">
          <button className="community-action-create-post">
            <img src="../images/plus.svg" alt="create post" />
            Create a post
          </button>

          {/* ✅ Join button with saved state */}
          <button
            className={`community-action-join ${joined ? "joined" : ""}`}
            onClick={handleJoin}
          >
            {joined ? "Joined" : "Join"}
          </button>

          <div className="community-action-more-container">
            <input type="checkbox" id={`more-${name}`} hidden />
            <button className="community-action-more">
              <label htmlFor={`more-${name}`}>
                <img src="../images/three-dots.svg" alt="More options" />
              </label>
            </button>
            <ul className="more-menu">
              <li className="more-menu-item">Add to custom feed</li>
              <li className="more-menu-item">Add to favourites</li>
              <li className="more-menu-item">Mute r/{name}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityHeader;