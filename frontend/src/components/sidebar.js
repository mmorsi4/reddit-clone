import React, { useState, useEffect , useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import CreateCommunityPopup from "./create-community";
import CustomFeedPopup from "../pages/CustomFeedPopup";

function Sidebar() {
  const [recent, setRecent] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [customFeeds, setCustomFeeds] = useState([]);
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getLinkClass = (path) => {
    if (path === "/home" && location.pathname === "/home") return "sidebar-link active";
    if (location.pathname.startsWith(path)) return "sidebar-link active";
    return "sidebar-link";
  };

  const handleOpenModal = (e) => {
    if (e) e.preventDefault();
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleFeedSubmission = (feedData) => {
    console.log("New Feed Data Submitted:", feedData);
    handleCloseModal();
  };

 // ✅ Fetch all communities
  const fetchCommunities = useCallback(async () => {
    try {
      const res = await fetch("/api/communities/");
      if (!res.ok) throw new Error("Failed to fetch communities");
      const data = await res.json();
      setCommunities(data);
    } catch (err) {
      console.error("Error fetching communities:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // fetch joined comms only to show under community section
  const fetchJoinedCommunities = useCallback(async () => {
    try {
      const res = await fetch("/api/memberships/joined");
      if (!res.ok) throw new Error("Failed to fetch joined communities");
      const data = await res.json();
      console.log(data)
      setJoinedCommunities(data);
    } catch (err) {
      console.error("Error fetching joined communities:", err);
    }
  }, []);

  // intial load joined communities
  useEffect(() => {
    fetchJoinedCommunities();
  }, [fetchJoinedCommunities]);

  // // Load recent
  // useEffect(() => {
  //     const recentData = JSON.parse(localStorage.getItem("recentCommunities")) || [];
  //     setRecent(recentData);
  //   }, []);

  // get recent communities
  const fetchRecentCommunities = useCallback(async () => {
    try {
      const res = await fetch('/api/users/recent-communities', {
        credentials: "include"
      });
      
      const data = await res.json();
      setRecent(data);

    } catch (err) {
      console.error("Error fetching recent communities:", err);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchRecentCommunities();
  }, [fetchRecentCommunities]);

  // ✅ Toggle favorite and immediately re-fetch
  const toggleFavorite = async (communityId) => {
    try {
      setJoinedCommunities(prev => prev.map(community => 
        community._id === communityId 
          ? { ...community, favorite: !community.favorite }
          : community
      ));

      const res = await fetch(`/api/memberships/favorite/${communityId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to toggle favorite");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ After creating a community → refresh automatically
  const handleCommunityCreated = async () => {
    setShowPopup(false);
    await fetchCommunities();
  };


  return (
    <div className="sidebar-container">
      <ul className="sidebar">
        {/* HOME / POPULAR / ALL */}
        <li>
          <ul className="sidebar-section">
            <li>
              <Link to="/home" className={getLinkClass("/home")}>
                <img src="../images/home.svg" alt="Home" />
                <div className="sidebar-section-item-details">Home</div>
              </Link>
            </li>
            <li>
              <Link to="/popular" className={getLinkClass("/popular")}>
                <img src="../images/popular.svg" alt="Popular" />
                <div className="sidebar-section-item-details">Popular</div>
              </Link>
            </li>
            <li>
              <Link to="/all" className={getLinkClass("/all")}>
                <img src="../images/all.svg" alt="All" />
                <div className="sidebar-section-item-details">All</div>
              </Link>
            </li>
            {/* Create Community button */}
            <li>
              <button
                onClick={() => setShowPopup(true)}
                className="sidebar-link create-btn"
              >
                <img src="../images/plus.svg" alt="Create" />
                <div className="sidebar-section-item-details">
                  Start a community
                </div>
              </button>
            </li>
          </ul>
        </li>

        {/* CUSTOM FEEDS */}
        <li>
          <input
            type="checkbox"
            className="sidebar-collapse-checkbox"
            id="sidebar-collapse-checkbox-custom-feeds"
          />
          <label
            className="sidebar-collapse-label"
            htmlFor="sidebar-collapse-checkbox-custom-feeds"
          >
            Custom Feeds <img src="../images/down.svg" alt="Expand" />
          </label>
          <ul className="sidebar-section">
            <li onClick={handleOpenModal}>
              <a className="sidebar-link" href="#">
                <img src="../images/plus.svg" alt="Create Feed" />
                <div className="sidebar-section-item-details">
                  Create Custom Feed
                </div>
              </a>
            </li>
          </ul>
        </li>

        {/* RECENT */}
        <li>
          <input
            type="checkbox"
            className="sidebar-collapse-checkbox"
            id="sidebar-collapse-checkbox-Recent"
          />
          <label
            className="sidebar-collapse-label"
            htmlFor="sidebar-collapse-checkbox-Recent"
          >
            RECENT <img src="../images/down.svg" alt="Expand" />
          </label>
          <ul className="sidebar-section">
            {recent.length === 0 ? (
              <li className="sidebar-link">
                <div className="sidebar-section-item-details">
                  No recent communities
                </div>
              </li>
            ) : (
              recent.map((community, index) => (
                <li key={index}>
                  <Link
                    to={`/community/${community.name}`}
                    className="sidebar-link"
                  >
                    <img
                      src={community.image}
                      className="sidebar-link-icon-round"
                      alt={community.name}
                    />
                    <div className="sidebar-section-item-details">
                      {community.name}
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </li>

        {/* COMMUNITIES */}
        <li>
          <input
            type="checkbox"
            id="sidebar-collapse-checkbox-communities"
            className="sidebar-collapse-checkbox"
          />
          <label
            htmlFor="sidebar-collapse-checkbox-communities"
            className="sidebar-collapse-label"
          >
            Communities <img src="../images/down.svg" alt="Expand" />
          </label>
          <ul className="sidebar-section">
            <li>
              <Link to="/manage_community" className="sidebar-link">
                <img src="../images/settings.svg" alt="Manage Community" />
                <div className="sidebar-section-item-details">
                  Manage Community
                </div>
              </Link>
            </li>

            {/* Render communities from DB */}
            {(joinedCommunities || []).length === 0 ? (
              <li className="sidebar-link">
                <div className="sidebar-section-item-details">Loading communities...</div>
              </li>
            ) : (
              [...joinedCommunities]
                .sort((a, b) => {
                  if (a.favorite && !b.favorite) return -1;
                  if (!a.favorite && b.favorite) return 1;
                  return 0;
                })
                .map((community) => (
                  <li key={community._id} className="sidebar-link-wrapper">
                    <Link to={`/community/${community.name}`} className="sidebar-link">
                      <img
                        src={community.avatar || "../images/default-community.svg"}
                        className="sidebar-link-icon-round"
                        alt={community.name}
                      />
                      <div className="sidebar-section-item-details">
                        <span className="community-name">{community.name}</span>
                        <button
                          className="make-favourite"
                          onClick={async (e) => {
                            e.preventDefault();
                            toggleFavorite(community._id);
                          }}
                        >
                          <img
                            src={community.favorite ? "/images/star-black.svg" : "/images/star.svg"}
                            alt="favorite"
                          />
                        </button>
                      </div>
                    </Link>
                  </li>
                ))
            )}
          </ul>
          <a href="#" className="copyright-link">
            Reddit, Inc. &copy;2025. All rights reserved.
          </a>
        </li>

        {/* RESOURCES */}
        {/* <li>
          <input
            type="checkbox"
            className="sidebar-collapse-checkbox"
            id="sidebar-collapse-checkbox-resources"
          />
          <label
            className="sidebar-collapse-label"
            htmlFor="sidebar-collapse-checkbox-resources"
          >
            RESOURCES <img src="../images/down.svg" alt="Expand" />
          </label>
          <ul className="sidebar-section">
            <li>
              <a href="#" className="sidebar-link">
                <img src="../images/plus.svg" alt="Create Community" />
                <div className="sidebar-section-item-details">
                  Create Community
                </div>
              </a>
            </li>
            <li>
              <Link to="/manage_community" className="sidebar-link">
                <img src="../images/settings.svg" alt="Manage Community" />
                <div className="sidebar-section-item-details">
                  Manage Community
                </div>
              </Link>
            </li>
          </ul>
        </li>*/}
        </ul>

      {/* Popup */}
      {showPopup && (
        <CreateCommunityPopup
          onClose={() => setShowPopup(false)}
          onCreate={() => { }}
        />
      )}
      {/* Conditionally render the popup */}
      {isModalOpen && (
        <CustomFeedPopup
          onClose={handleCloseModal}
          onSubmit={handleFeedSubmission}
        />
      )}
    </div>

  );
}

export default Sidebar;