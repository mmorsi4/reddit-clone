import React, { useState, useEffect, useRef } from "react";

function SearchBar() {
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);

  // Fetch communities from backend
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/communities");
        if (!res.ok) throw new Error("Failed to load communities");
        const data = await res.json();
        setCommunities(data);
      } catch (err) {
        console.error(err);
        alert("Network error while loading communities");
      }
    };
    loadCommunities();
  }, []);

  // Filter communities based on search term
  useEffect(() => {
    const filtered = communities.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchTerm, communities]);

  // Hide results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCommunityClick = (community) => {
    console.log("Clicked community:", community);
    setShowResults(false); // hide results when clicking a community
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
        onFocus={() => setShowResults(true)} // show results when focused
      />

      <div className={`search-results ${showResults && filteredResults.length > 0 ? "show" : ""}`}>
        <div className="search-results-scrollable">
          <ul className="recent-searches">
            {filteredResults.map((community, index) => (
              <li key={index} onClick={() => handleCommunityClick(community)}>
                <img
                  src={community.avatar || "../images/default-community.svg"}
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