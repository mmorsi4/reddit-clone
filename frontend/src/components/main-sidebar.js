import React from "react";
import "../styles/main-sidebar.css";

const MainSidebar = ({ community }) => {
  if (!community) return null;

  return (
    <div className="main-sidebar">
      <div className="main-sidebar-community-info">
        <div className="main-sidebar-description">
          <h2 className="main-sidebar-description-title">
            {community.name}
          </h2>
          <div className="main-sidebar-description-detailed">
            {community.description}
          </div>
        </div>

        <div className="main-sidebar-community-stats">
          <div className="main-sidebar-stats-overall">
            <div className="main-sidebar-stats-amount">
              {community.members}
            </div>
            <div className="main-sidebar-stats-label">Members</div>
          </div>

          <div className="main-sidebar-stats-overall">
            <div className="main-sidebar-stats-amount">
              {community.online}
            </div>
            <div className="main-sidebar-stats-label">
              <div className="main-sidebar-online-dot"></div>
              Online
            </div>
          </div>

          <div className="main-sidebar-stats-overall">
            <div className="main-sidebar-stats-amount">
              {community.rank}
            </div>
            <div className="main-sidebar-stats-label">Rank by size</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSidebar;