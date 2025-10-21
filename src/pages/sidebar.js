import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import allCommunities from "../data/communitiesDB";

function Sidebar() {
  const [recent, setRecent] = useState([]);
  const location = useLocation(); // to detect navigation changes

  // Load recent communities from localStorage
  useEffect(() => {
    const recentData = JSON.parse(localStorage.getItem("recentCommunities")) || [];
    setRecent(recentData);
  }, []);

  // ✅ When the user visits a community route, check if it matches one in allCommunities
  useEffect(() => {
    const matchedCommunity = allCommunities.find(
      (community) => community.link === location.pathname
    );
    if (matchedCommunity) {
      // Add to recent if not already there
      setRecent((prev) => {
        let updated = [matchedCommunity, ...prev.filter((c) => c.name !== matchedCommunity.name)];
        if (updated.length > 5) updated = updated.slice(0, 5);
        localStorage.setItem("recentCommunities", JSON.stringify(updated));
        return updated;
      });
    }
  }, [location.pathname]);

  return (
    <div className="sidebar-container">
      <ul className="sidebar">
        {/* HOME / POPULAR / ALL */}
        <li>
          <ul className="sidebar-section">
            <li>
              <Link to="/" className="sidebar-link active">
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
            <li>
              <a href="#" className="sidebar-link">
                <img src="../images/plus.svg" alt="Create Feed" />
                <div className="sidebar-section-item-details">Create Custom Feed</div>
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
                  <Link to={community.link} className="sidebar-link">
                    <img
                      src={community.image || "../images/default-community.svg"}
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
              <a href="#" className="sidebar-link">
                <img src="../images/plus.svg" alt="Create Community" />
                <div className="sidebar-section-item-details">Create Community</div>
              </a>
            </li>
            <li>
              <Link to="/manage_community" className="sidebar-link">
                <img src="../images/settings.svg" alt="Manage Community" />
                <div className="sidebar-section-item-details">Manage Community</div>
              </Link>
            </li>
            {allCommunities.map((community, index) => (
              <li key={index}>
                <Link to={community.link} className="sidebar-link">
                  <img
                    src={community.image || "../images/default-community.svg"}
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
                <div className="sidebar-section-item-details">Create Community</div>
              </a>
            </li>
            <li>
              <Link to="/manage_community" className="sidebar-link">
                <img src="../images/settings.svg" alt="Manage Community" />
                <div className="sidebar-section-item-details">Manage Community</div>
              </Link>
            </li>
          </ul>
          <a href="#" className="copyright-link">
            Reddit, Inc. &copy;2025. All rights reserved.
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;