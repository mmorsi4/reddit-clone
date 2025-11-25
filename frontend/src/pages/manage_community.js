import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function ManageCommunity() {
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJoined = async () => {
      try {
        const res = await fetch("/api/memberships/joined", {
          credentials: "include",
        });

        const data = await res.json();
        setCommunities(data.map(c => ({ ...c, joined: true }))); // set joined to true to be consistent with ui

      } catch (err) {
        console.error("Failed to load joined communities:", err);
      }
    };

    fetchJoined();
  }, []);

  const handleJoinToggle = async (communityId, name, currentlyJoined) => {
    try {
      const endpoint = currentlyJoined
        ? "/api/memberships/unjoin"
        : "/api/memberships/join";

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

      // change join button
      setCommunities(prev =>
        prev.map(c =>
          c._id === communityId ? { ...c, joined: !currentlyJoined } : c
        )
      );
      
    } catch (err) {
      console.error("Error toggling membership:", err);
      alert("Failed to update membership. Please try again.");
    }
  };

  const handleFavoriteToggle = async (id) => {
    try {
      setCommunities((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, favorite: !c.favorite } : c
        )
      );

      await fetch(`/api/memberships/favorite/${id}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <Sidebar />
      <div className="main">
        <h1>Manage communities</h1>
        <input
          type="text"
          placeholder="Search communities..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filtered.length === 0 ? (
          <p>No joined communities found.</p>
        ) : (
          <div className="community-list">
            {filtered.map((community) => (
              <div className="community-card" key={community._id}>
                <img src={community.avatar} alt={community.name} />
                <div className="community-info"> {/* Add this wrapper */}
                  <p className="community-name">
                      <Link className="community-link" to={`/community/${community.name}`}>
                        r/{community.name}
                      </Link>
                  </p>
                  <p className="community-description">{community.description}</p>
                </div>
                <button
                  className="make-favouriteMC"
                  onClick={async (e) => {
                    e.preventDefault();
                    handleFavoriteToggle(community._id);
                  }}
                >
                  <img
                    src={community.favorite ? "/images/star-black.svg" : "/images/star.svg"}
                    alt="favorite"
                  />
                </button>
                <button
                  className={`join-toggle ${community.joined ? "joined" : ""}`}
                  onClick={() =>
                    handleJoinToggle(
                      community._id,
                      community.name,
                      community.joined
                    )
                  }
                >
                  {community.joined ? "Joined" : "Join"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ManageCommunity;