import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import allCommunities from "../data/communitiesDB";

function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("joinedCommunities")) || [];
    setJoinedCommunities(saved);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults([]);
      return;
    }

    const results = allCommunities
      .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((c) => ({
        ...c,
        joined: joinedCommunities.some((j) => j.name === c.name),
      }));

    setFilteredResults(results);
  }, [searchTerm, joinedCommunities]);


  const handleCommunityClick = (community) => {
    navigate(community.link); // ✅ uses link from the database
  };

  return (
    <div className="search">
      <img src="../images/search.svg" alt="search" />
      <input
        type="text"
        placeholder="Search Reddit"
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className={`search-results ${filteredResults.length > 0 ? "show" : ""}`}>
        <div className="search-results-scrollable">
          <ul className="recent-searches">
            {filteredResults.map((community, index) => (
              <li key={index} onClick={() => handleCommunityClick(community)}>
                <img
                  src={community.image || "../images/default-community.svg"}
                  alt={community.name}
                  className="community-image"
                />
                <span className="recent-search-value">{community.name}</span>
                {community.joined && (
                  <span style={{ marginLeft: "8px", color: "#888" }}>Joined</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;