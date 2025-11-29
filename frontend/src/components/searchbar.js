import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate(); // hook to navigate programmatically

    useEffect(() => {
    console.log("showResults:", showResults);
    console.log("filteredResults length:", filteredResults.length);
  }, [showResults, filteredResults]);

  // Fetch communities
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const res = await fetch("api/communities");
        if (!res.ok) throw new Error("Failed to load communities");
        const data = await res.json();
        setCommunities(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCommunities();
  }, []);

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("api/users");
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      const allCommunities = communities.map(item => ({ ...item, type: 'community' }));
      const allUsers = users.map(item => ({ ...item, type: 'user' }));
      const combinedResults = [...allCommunities, ...allUsers].slice(0, 5); // Limit to 20 total
      setFilteredResults(combinedResults);
    }
    else{
      const lowercasedTerm = searchTerm.toLowerCase();
      
      const filteredCommunities = communities
        .filter(c => c.name && c.name.toLowerCase().includes(lowercasedTerm))
        .map(item => ({ ...item, type: 'community' }));

      const filteredUsers = users
        .filter(u => u.username && u.username.toLowerCase().includes(lowercasedTerm))
        .map(item => ({ ...item, type: 'user' }));

      // Combine and limit results
      const combinedResults = [...filteredCommunities, ...filteredUsers].slice(0, 5);
      setFilteredResults(combinedResults);
    }
  }, [searchTerm, communities, users]);

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

  const handleUserClick = (user) => {
    setShowResults(false);
    setSearchTerm("");
    navigate(`/profile/${user.username}`);
  };

  const handleItemClick = (item) => {
    if (item.type === 'community') {
      handleCommunityClick(item);
    } else {
      handleUserClick(item);
    }
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
              {filteredResults.map((item, index) => (
                <li key={`${item.type}-${index}`} onClick={() => handleItemClick(item)}>
                  <img
                    src={
                      item.type === 'community' 
                        ? (item.avatar || "../images/community-avatar-placeholder.png")
                        : (item.avatar || "../images/avatar.png")
                    } 
                    alt={item.type === 'community' ? item.name : item.username}
                    className={`community-image`}
                  />
                  <div className="search-item-info">
                    <span className="search-item-name">
                      {item.type === 'community' ? `r/${item.name}` : `u/${item.username}`}
                    </span>
                  </div>
                  {item.type === 'community' && item.joined && (
                    <span className="joined-badge">Joined</span>
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