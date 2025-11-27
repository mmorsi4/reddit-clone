import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CommunityHeader({ banner, avatar, name, communityId }) {
  const [joined, setJoined] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [favorite, setFavorite] = useState(false);

  // ✅ Check membership from backend on mount
  useEffect(() => {
    const checkMembership = async () => {
      if (!communityId) return;
      try {
        const res = await fetch(`/api/memberships/check?communityId=${communityId}`, {
          credentials: "include",
        });
        const data = await res.json();
        console.log(data.isMember, data.isFavorite);
        setJoined(data.isMember);
        setFavorite(data.isFavorite);
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

    if (joined && favorite) {
        setFavorite(false);
    }

    setJoined(prev => !prev); // toggle state correctly
  } catch (err) {
    console.error("Error joining/unjoining community:", err);
    alert("Failed to update membership. Please try again.");
  }
};

  // // add to recent communities
  // useEffect(() => {
  //   const recent = JSON.parse(localStorage.getItem("recentCommunities")) || [];
  //   const newCommunity = { name, image: avatar, link: `/community/${name}` };
  //   const updated = [newCommunity, ...recent.filter(c => c.name !== name)].slice(0, 5);
  //   localStorage.setItem("recentCommunities", JSON.stringify(updated));
  // }, [name, avatar]);

  useEffect(() => {
  const updateRecentCommunity = async () => {
    try {
      await fetch('/api/users/recent-communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ communityId }), // based on the community id
      });
    } catch (err) {
      console.error('Failed to update recent communities:', err);
    }
  };

  updateRecentCommunity();
  }, [communityId]);

  const toggleFavorite = async () => {
    try {
      if(!joined){
        await handleJoin();  
      }

      setShowMenu(false);
      setFavorite(prev => !prev);
      
      const res = await fetch(`/api/memberships/favorite/${communityId}`, { 
        method: "POST",
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to toggle favorite");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Placeholder for custom feed (you'll need to implement this)
  const handleCustomFeed = () => {
    // Implement custom feed logic here
    console.log("Custom feed clicked");
    setShowMenu(false);
  };

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
          <Link to={`/create_post?community=${name}`} className="no-underline">
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
            <li className="more-menu-item" onClick={handleCustomFeed}>
              {/* {1 ? "Remove from custom feed" : "Add to custom feed"} */}
              Add to custom feed
            </li>
            <li className="more-menu-item" onClick={toggleFavorite}>
              { favorite ? "Remove from favorites" : "Add to favorites"}
            </li>
          </ul>
        </div>
        
        </div>
      </div>
    </div>
  );
}

export default CommunityHeader;