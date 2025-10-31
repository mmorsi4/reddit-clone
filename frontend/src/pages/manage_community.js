import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function ManageCommunity() {
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
      try {
        // 1️⃣ Fetch all communities
        const res = await fetch("/api/communities", { credentials: "include" });
        const allCommunities = await res.json();

        // 2️⃣ Check membership for each community
        const updated = await Promise.all(
          allCommunities.map(async (community) => {
            let isMember = false;
            try {
              const resCheck = await fetch(
                `/api/memberships/check?communityId=${community._id}`,
                { credentials: "include" }
              );
              const data = await resCheck.json();
              isMember = data.isMember;
            } catch (err) {
              console.error(`Failed to fetch membership for ${community.name}:`, err);
            }
            return { ...community, joined: isMember };
          })
        );

        // 3️⃣ Only keep joined communities
        setCommunities(updated.filter((c) => c.joined));
      } catch (err) {
        console.error("Failed to fetch communities:", err);
      }
    };

    fetchJoinedCommunities();
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

      // Update state: remove unjoined
      setCommunities((prev) =>
        prev
          .map((c) =>
            c._id === communityId ? { ...c, joined: !currentlyJoined } : c
          )
          .filter(c => c.joined)
      );
    } catch (err) {
      console.error("Error toggling membership:", err);
      alert("Failed to update membership. Please try again.");
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
                <span>r/{community.name}</span>
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