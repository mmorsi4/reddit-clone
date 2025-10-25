import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CommunityHeader({ banner, avatar, name }) {
  const storageKey = `joined_${name}`;
  const [joined, setJoined] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInCustomFeed, setIsInCustomFeed] = useState(false);

  //  Load joined state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.joined) setJoined(true);
      } catch {
        if (saved === "true") setJoined(true);
      }
    }
  }, [storageKey]);

  //  Handle join/unjoin
  const handleJoin = () => {
    const newState = !joined;
    setJoined(newState);

    const dataToSave = { joined: newState, avatar, banner };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    const all = JSON.parse(localStorage.getItem("joinedCommunities")) || [];

    if (newState) {
      const newCommunity = { name, image: avatar };
      const updated = [...all.filter(c => c.name !== name), newCommunity];
      localStorage.setItem("joinedCommunities", JSON.stringify(updated));
    } else {
      const updated = all.filter(c => c.name !== name);
      localStorage.setItem("joinedCommunities", JSON.stringify(updated));
    }
  };

  //  Add to RECENT communities
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentCommunities")) || [];
    const newCommunity = { name, image: avatar, link: `/community/${name}` };
    const updated = [newCommunity, ...recent.filter(c => c.name !== name)].slice(0, 5);
    localStorage.setItem("recentCommunities", JSON.stringify(updated));
  }, [name, avatar]);

  //  Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".community-action-more-container")) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  //  Load mute state
  useEffect(() => {
    const mutedList = JSON.parse(localStorage.getItem("mutedCommunities")) || [];
    setIsMuted(mutedList.includes(name));
  }, [name]);

  //  Handle mute/unmute
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

  //  Handle Add/Remove from Custom Feed
  const handleAddToCustomFeed = (communityName, avatar) => {
    let customFeeds = JSON.parse(localStorage.getItem("customFeeds")) || [];

    const newCommunity = {
      name: communityName,
      avatar: avatar,
      link: `/community/${communityName}`,
    };

    const exists = customFeeds.some((c) => c.name === communityName);

    if (exists) {
      // remove from custom feed
      customFeeds = customFeeds.filter((c) => c.name !== communityName);
      setIsInCustomFeed(false);
    } else {
      // add to custom feed
      customFeeds = [newCommunity, ...customFeeds.filter((c) => c.name !== communityName)];
      if (customFeeds.length > 10) customFeeds = customFeeds.slice(0, 10);
      setIsInCustomFeed(true);
    }

    // save and notify sidebar
    localStorage.setItem("customFeeds", JSON.stringify(customFeeds));
    window.dispatchEvent(new Event("customFeedUpdated"));
  };

  //  Check if already in custom feeds (on page load)
  useEffect(() => {
    const customFeeds = JSON.parse(localStorage.getItem("customFeeds")) || [];
    setIsInCustomFeed(customFeeds.some((c) => c.name === name));
  }, [name]);

  return (
    <div className="main-head">
      {/* Banner Upload */}
      <div className="banner-container">
        <label htmlFor="bannerUpload">
          <img
            src={banner}
            className="main-head-banner"
            alt="community banner"
            style={{ cursor: "pointer" }}
          />
        </label>
        <input
          id="bannerUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const newBanner = reader.result;
                const existing = JSON.parse(localStorage.getItem(storageKey)) || {};
                const updated = { ...existing, banner: newBanner };
                localStorage.setItem(storageKey, JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent("bannerUpdated", { detail: { name, banner: newBanner } }));
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>

      {/* ✅ Community Info */}
      <div className="main-head-info">
        <div className="main-head-community">
          <img src={avatar} className="community-avatar" alt="community avatar" />
          <h1>r/{name}</h1>
        </div>

        {/* ✅ Actions */}
        <div className="community-actions">
          <Link to="/create_post" className="no-underline">
            <button className="community-action-create-post">
              <img src="../images/plus.svg" alt="create post" />
              Create a post
            </button>
          </Link>

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
                e.stopPropagation();
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