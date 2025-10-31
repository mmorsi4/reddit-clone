import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import allCommunities from "../data/communitiesDB";
import CreateCommunityPopup from "./create-community";
import CustomFeedPopup from "../pages/CustomFeedPopup";

function Sidebar() {
  const [recent, setRecent] = useState([]);
  const [customCommunities, setCustomCommunities] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [customFeeds, setCustomFeeds] = useState([]);
  const location = useLocation();

  // State to control the visibility of the CustomFeedPopup
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (e) => {
    // Prevent any default link/navigation behavior if an anchor tag is used
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFeedSubmission = (feedData) => {
    console.log('New Feed Data Submitted:', feedData);
    // Add your API call or state management logic here
    handleCloseModal();
  };

  // Load recent communities
  useEffect(() => {
    const recentData = JSON.parse(localStorage.getItem("recentCommunities")) || [];
    setRecent(recentData);
  }, []);


  useEffect(() => {
    const storedFeeds = JSON.parse(localStorage.getItem("customFeeds")) || [];
    setCustomFeeds(storedFeeds);
    const updateFeeds = () => {
      const updated = JSON.parse(localStorage.getItem("customFeeds")) || [];
      setCustomFeeds(updated);
    };

    window.addEventListener("customFeedUpdated", updateFeeds);

    return () => window.removeEventListener("customFeedUpdated", updateFeeds);
  }, [])

  // Load all custom communities
  useEffect(() => {
    const loadCustom = () => {
      const stored = JSON.parse(localStorage.getItem("customCommunities")) || [];
      setCustomCommunities(stored);
    };

    loadCustom();
    window.addEventListener("customCommunityUpdated", loadCustom);
    return () => window.removeEventListener("customCommunityUpdated", loadCustom);
  }, []);

  // Detect when user visits a community
  useEffect(() => {
    if (location.pathname.startsWith("/community/")) {
      const communityName = location.pathname.split("/")[2];
      const matched = [...allCommunities, ...customCommunities].find(
        (c) => c.name === communityName
      );

      if (matched) {
        setRecent((prev) => {
          let updated = [
            matched,
            ...prev.filter((c) => c.name !== matched.name),
          ];
          if (updated.length > 5) updated = updated.slice(0, 5);
          localStorage.setItem("recentCommunities", JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [location.pathname, customCommunities]);

  return (
    <div className="sidebar-container">
      <ul className="sidebar">
        {/* HOME / POPULAR / ALL */}
        <li>
          <ul className="sidebar-section">
            <li>
              <Link to="/home" className="sidebar-link active">
                <img src="../images/home.svg" alt="Home" />
                <div className="sidebar-section-item-details">Home</div>
              </Link>
            </li>
            <li>
              <a href="#" className="sidebar-link">
                <img src="../images/popular.svg" alt="Popular" />
                <div className="sidebar-section-item-details">Popular</div>
              </a>
            </li>
            <li>
              <a href="#" className="sidebar-link">
                <img src="../images/all.svg" alt="All" />
                <div className="sidebar-section-item-details">All</div>
              </a>
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

            {customFeeds.length === 0 ? (
              <li className="sidebar-link">
                <div className="sidebar-section-item-details">No custom feeds yet</div>
              </li>
            ) : (
              customFeeds.map((feed, index) => (
                <li key={index}>
                  <Link to={feed.link} className="sidebar-link">
                    <img
                      src={feed.avatar || "../images/default-community.svg"}
                      className="sidebar-link-icon-round"
                      alt={feed.name}
                    />
                    <div className="sidebar-section-item-details">{feed.name}</div>
                  </Link>
                </li>
              ))
            )}
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
                      src={community.avatar || "../images/default-community.svg"}
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
            {/* Create Community button */}
            <li>
              <button
                onClick={() => setShowPopup(true)}
                className="sidebar-link create-btn"
              >
                <img src="../images/plus.svg" alt="Create" />
                <div className="sidebar-section-item-details">
                  Create Community
                </div>
              </button>
            </li>
            <li>
              <Link to="/manage_community" className="sidebar-link">
                <img src="../images/settings.svg" alt="Manage Community" />
                <div className="sidebar-section-item-details">
                  Manage Community
                </div>
              </Link>
            </li>

            {/* Default communities */}
            {allCommunities.map((community, index) => (
              <li key={`default-${index}`}>
                <Link
                  to={`/community/${community.name}`}
                  className="sidebar-link"
                >
                  <img
                    src={community.avatar || "../images/default-community.svg"}
                    className="sidebar-link-icon-round"
                    alt={community.name}
                  />
                  <div className="sidebar-section-item-details">
                    {community.name}
                  </div>
                </Link>
              </li>
            ))}

            {/* Custom-created communities */}
            {customCommunities.map((community, index) => (
              <li key={`custom-${index}`}>
                <Link
                  to={`/community/${community.name}`}
                  className="sidebar-link"
                >
                  <img
                    src={community.avatar || "../images/default-community.svg"}
                    className="sidebar-link-icon-round"
                    alt={community.name}
                  />
                  <div className="sidebar-section-item-details">
                    {community.name}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/* RESOURCES */}
        <li>
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
          <a href="#" className="copyright-link">
            Reddit, Inc. &copy;2025. All rights reserved.
          </a>
        </li>
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