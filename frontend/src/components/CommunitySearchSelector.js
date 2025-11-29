import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/CommunitySearchSelector.css"

function CommunitySearchSelector({ onSelectCommunity, currentSelectedCommunities }) {
  const [allCommunities, setAllCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef(null);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/communities");
      if (!res.ok) throw new Error("Failed to load communities");
      const data = await res.json();
      setAllCommunities(data);
    } catch (err) {
      console.error("Error fetching communities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = allCommunities.filter(
        (c) => c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
      setShowResults(true);
    } else {
      setFilteredResults([]); 
    }
  }, [searchTerm, allCommunities]);

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

  const isCommunitySelected = (community) => {
    return currentSelectedCommunities.some(c => c._id === community._id);
  };
  
  const handleItemClick = (community) => {
    onSelectCommunity(community);
  };

  return (
    <div className="community-search-selector" ref={searchRef}>
      <div className="search-input-area">
        <img src="../images/search.svg" alt="search" className="search-icon-selector" />
        <input
          type="text"
          placeholder="Search communities"
          className="search-input-selector"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)} 
        />
      </div>

      {showResults && searchTerm.length > 1 && (
        <div className="search-results-selector">
          {loading && <p className="status-text">Loading...</p>}
          
          {!loading && filteredResults.length === 0 && (
            <p className="status-text">No results found for "{searchTerm}"</p>
          )}

          {!loading && filteredResults.length > 0 && (
            <ul className="community-list">
              {filteredResults.map((community) => {
                const isSelected = isCommunitySelected(community);
                return (
                  <li 
                    key={community._id} 
                    className={`community-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleItemClick(community)}
                  >
                    <img
                      src={community.avatar || "../images/default-community.svg"}
                      alt={community.name || "Community"}
                      className="community-image-selector"
                    />
                    <span className="community-name-selector">{community.name || "Unnamed"}</span>
                    <button className={`select-button ${isSelected ? 'selected' : ''}`}>
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default CommunitySearchSelector;
