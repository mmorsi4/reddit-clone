import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CommunityHeader({ banner, avatar, name, communityId }) {
  const [joined, setJoined] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInCustomFeed, setIsInCustomFeed] = useState(false);

  // ✅ Check membership from backend on mount
  useEffect(() => {
    const checkMembership = async () => {
      if (!communityId) return;
      try {
        const res = await fetch(`/api/memberships/check?communityId=${communityId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setJoined(data.isMember);
      } catch (err) {
        console.error("Failed to fetch membership status:", err);
      }
    };
    checkMembership();
  }, [communityId]);

  // ✅ Join / Unjoin community
  const handleJoin = async () => {
  if (!communityId) return;

  try {
    const endpoint = joined ? "/api/memberships/unjoin" : "/api/memberships/join";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityId }),
      credentials: "include",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    setJoined(prev => !prev); // toggle state correctly
  } catch (err) {
    console.error("Error joining/unjoining community:", err);
    alert("Failed to update membership. Please try again.");
  }
};

  // ✅ Add to RECENT communities
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentCommunities")) || [];
    const newCommunity = { name, image: avatar, link: `/community/${name}` };
    const updated = [newCommunity, ...recent.filter(c => c.name !== name)].slice(0, 5);
    localStorage.setItem("recentCommunities", JSON.stringify(updated));
  }, [name, avatar]);

  // ✅ Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".community-action-more-container")) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Load mute state
  useEffect(() => {
    const mutedList = JSON.parse(localStorage.getItem("mutedCommunities")) || [];
    setIsMuted(mutedList.includes(name));
  }, [name]);

  const handleMute = () => {
    let mutedList = JSON.parse(localStorage.getItem("mutedCommunities")) || [];
    if (isMuted) mutedList = mutedList.filter(n => n !== name);
    else mutedList.push(name);
    localStorage.setItem("mutedCommunities", JSON.stringify(mutedList));
    setIsMuted(!isMuted);
    alert(isMuted ? `r/${name} unmuted` : `r/${name} muted`);
  };

  // ✅ Custom feed
  const handleAddToCustomFeed = () => {
    let customFeeds = JSON.parse(localStorage.getItem("customFeeds")) || [];
    const exists = customFeeds.some(c => c.name === name);

    if (exists) customFeeds = customFeeds.filter(c => c.name !== name);
    else customFeeds = [{ name, avatar, link: `/community/${name}` }, ...customFeeds];

    if (customFeeds.length > 10) customFeeds = customFeeds.slice(0, 10);

    localStorage.setItem("customFeeds", JSON.stringify(customFeeds));
    setIsInCustomFeed(!exists);
    window.dispatchEvent(new Event("customFeedUpdated"));
  };

  useEffect(() => {
    const customFeeds = JSON.parse(localStorage.getItem("customFeeds")) || [];
    setIsInCustomFeed(customFeeds.some(c => c.name === name));
  }, [name]);

  return (
    <div className="main-head">
      <div className="banner-container">
        <img src={banner} className="main-head-banner" alt="community banner" />
      </div>

      <div className="main-head-info">
        <div className="main-head-community">
          <img src={avatar} className="community-avatar" alt="community avatar" />
          <h1>r/{name}</h1>
        </div>

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
              onClick={e => { e.stopPropagation(); setShowMenu(prev => !prev); }}
            >
              <img src="../images/three-dots.svg" alt="More options" />
            </button>

            <ul className={`more-menu ${showMenu ? "visible" : ""}`}>
              <li className="more-menu-item" onClick={handleAddToCustomFeed}>
                {isInCustomFeed ? "Remove from custom feed" : "Add to custom feed"}
              </li>
              <li className="more-menu-item">Add to favourites</li>
              <li className="more-menu-item" onClick={handleMute}>
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