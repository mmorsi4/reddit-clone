import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate(); // hook to navigate programmatically

  // Fetch communities
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/communities");
        if (!res.ok) throw new Error("Failed to load communities");
        const data = await res.json();
        setCommunities(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCommunities();
  }, []);

  // Filter communities
  useEffect(() => {
    const filtered = communities.filter(
      (c) => c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchTerm, communities]);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCommunityClick = (community) => {
    setShowResults(false);
    // Navigate to community page
    navigate(`/community/${community.name}`);
  };

  return (
    <div className="search" ref={searchRef}>
      <img src="../images/search.svg" alt="search" />
      <input
        type="text"
        placeholder="Search Reddit"
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowResults(true)}
      />

      {showResults && filteredResults.length > 0 && (
        <div className="search-results show">
          <div className="search-results-scrollable">
            <ul className="recent-searches">
              {filteredResults.map((community, index) => (
                <li key={index} onClick={() => handleCommunityClick(community)}>
                  <img
                    src={community.avatar || "../images/default-community.svg"}
                    alt={community.name || "Community"}
                    className="community-image"
                  />
                  <span className="recent-search-value">{community.name || "Unnamed"}</span>
                  {community.joined && (
                    <span style={{ marginLeft: "8px", color: "#888" }}>Joined</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;