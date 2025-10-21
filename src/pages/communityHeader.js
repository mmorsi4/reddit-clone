import React, { useState, useEffect } from "react";

function CommunityHeader({ banner, avatar, name }) {
  const storageKey = `joined_${name}`;
  const [joined, setJoined] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInCustomFeed, setIsInCustomFeed] = useState(false);


  // Load from localStorage when component loads
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

  // Handle join / unjoin
  const handleJoin = () => {
    const newState = !joined;
    setJoined(newState);

    const dataToSave = {
      joined: newState,
      avatar: avatar,
      banner: banner,
    };

    // Save per-community data
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    // ✅ Update the global "joinedCommunities" list for the Home search
    const all = JSON.parse(localStorage.getItem("joinedCommunities")) || [];

    if (newState) {
      // Add community if joining
      const newCommunity = { name, image: avatar };
      const updated = [...all.filter(c => c.name !== name), newCommunity];
      localStorage.setItem("joinedCommunities", JSON.stringify(updated));
    } else {
      // Remove if unjoining
      const updated = all.filter(c => c.name !== name);
      localStorage.setItem("joinedCommunities", JSON.stringify(updated));
    }
  };

  // Add community to RECENT visited list
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentCommunities")) || [];
    const newCommunity = { name, image: avatar, link: `/r/${name}` };
    // remove duplicates, add new on top, keep max 5
    const updated = [newCommunity, ...recent.filter(c => c.name !== name)].slice(0, 5);
    localStorage.setItem("recentCommunities", JSON.stringify(updated));
  }, [name, avatar]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".community-action-more-container")) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Load mute state
  useEffect(() => {
    const mutedList = JSON.parse(localStorage.getItem("mutedCommunities")) || [];
    setIsMuted(mutedList.includes(name));
  }, [name]);

  // Handle mute / unmute
  const handleMute = (communityName) => {
    let mutedList = JSON.parse(localStorage.getItem("mutedCommunities")) || [];

    if (isMuted) {
      mutedList = mutedList.filter((n) => n !== communityName);
      alert(`r/${communityName} unmuted`);
    } else {
      mutedList.push(communityName);
      alert(`r/${communityName} muted`);
    }

    localStorage.setItem("mutedCommunities", JSON.stringify(mutedList));
    setIsMuted(!isMuted);
  };

  /// Handle Add/Remove from Custom Feed
  const handleAddToCustomFeed = (communityName, avatar) => {
    let customFeeds = JSON.parse(localStorage.getItem("customFeeds")) || [];

    const newCommunity = {
      name: communityName,
      image: avatar,
      link: `/r/${communityName}`, // ✅ same format as recentCommunities
    };

    const exists = customFeeds.some((c) => c.name === communityName);

    if (exists) {
      // Remove existing
      customFeeds = customFeeds.filter((c) => c.name !== communityName);
      setIsInCustomFeed(false);
    } else {
      // Add new on top, remove duplicates, keep only 10 for example
      customFeeds = [newCommunity, ...customFeeds.filter((c) => c.name !== communityName)];
      if (customFeeds.length > 10) customFeeds = customFeeds.slice(0, 10);
      setIsInCustomFeed(true);
    }

    // Save updated list
    localStorage.setItem("customFeeds", JSON.stringify(customFeeds));

    // Dispatch event to update sidebar immediately
    window.dispatchEvent(new Event("customFeedUpdated"));
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

          {/* Join button with saved state */}
          <button
            className={`community-action-join ${joined ? "joined" : ""}`}
            onClick={handleJoin}
          >
            {joined ? "Joined" : "Join"}
          </button>

          <div className="community-action-more-container">
            <button
              className="community-action-more"
              onClick={(e) => {
                e.stopPropagation(); // prevent closing instantly
                setShowMenu((prev) => !prev);
              }}
            >
              <img src="../images/three-dots.svg" alt="More options" />
            </button>

            <ul className={`more-menu ${showMenu ? "visible" : ""}`}>
              <li
                className="more-menu-item"
                onClick={() => handleAddToCustomFeed(name, avatar)}
              >
                {isInCustomFeed ? "Remove from custom feed" : "Add to custom feed"}
              </li>

              <li className="more-menu-item">Add to favourites</li>

              <li
                className="more-menu-item"
                onClick={() => {
                  handleMute(name);
                  setShowMenu(false);
                }}
              >
                {isMuted ? `Unmute r/${name}` : `Mute r/${name}`}
              </li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityHeader;