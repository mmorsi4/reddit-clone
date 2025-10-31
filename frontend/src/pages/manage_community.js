import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import Header from "../components/header";

function ManageCommunity() {
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const communities = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key.startsWith("joined_")) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.joined) {
          const name = key.replace("joined_", "");
          communities.push({
            name: name,
            avatar: data.avatar || "../images/community-avatar1.jpg", // ✅ use stored avatar
          });
        }
      }
    }

    setJoinedCommunities(communities);
  }, []);

  // ✅ Filter communities based on search
  const filtered = joinedCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <>
      <Header />
      <Sidebar/>
      <div className="main">
        <h1>Manage communities</h1>
        <input
          type="text"
          id="communitySearch"
          placeholder="Search communities..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div id="allCommunities" className="community-list">
          {filtered.length === 0 ? (
            <p>No joined communities found.</p>
          ) : (
            filtered.map((community, index) => (
              <div className="community-card" key={index}>
                <img src={community.avatar} alt={community.name} />
                <span>r/{community.name}</span>

                <button
                  className="join-toggle joined"
                  onClick={() => {
                    // Unjoin functionality
                    localStorage.setItem(`joined_${community.name}`, "false");
                    setJoinedCommunities((prev) =>
                      prev.filter((c) => c.name !== community.name)
                    );
                  }}
                >
                  Joined
                </button>
              </div>
            ))
          )}
        </div>

      </div>


    </>
  );
}
export default ManageCommunity;