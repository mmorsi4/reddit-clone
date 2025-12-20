import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ProfileSidebar({ user, isOwnProfile = false, }) {
  const [followersCount, setFollowersCount] = useState(13); // Default from image
  const [karma, setKarma] = useState(661); // From image
  const [contributions, setContributions] = useState(208); // From image
  const [isFollowing, setIsFollowing] = useState(false);
  const [customFeeds, setCustomFeeds] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  console.log("isOwnProfile =", isOwnProfile);

  // Format numbers with commas
  const formatKarmaWithCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };


  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?._id) return;

      try {
        // Use data from image as defaults
        setKarma(661);
        setContributions(208);
        setFollowersCount(13);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [user?._id]);

  const handleFollowToggle = async () => {
    if (!user?._id) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You need to be logged in to follow users!");
        return;
      }

      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/users/${user._id}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/u/${user.username}`;
    navigator.clipboard.writeText(profileUrl);
    alert("Profile URL copied to clipboard!");
  };

  useEffect(() => {
    const fetchProfileFeeds = async () => {
      if (!user?._id) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/customfeeds/profile/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch custom feeds");

        const data = await res.json();
        setCustomFeeds(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfileFeeds();
  }, [user?._id]);

  if (!user) {
    return (
      <div className="profile-sidebar-container">
        <div className="profile-sidebar-skeleton">
          <div className="profile-sidebar-skeleton-line"></div>
          <div className="profile-sidebar-skeleton-line"></div>
          <div className="profile-sidebar-skeleton-line"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="profile-sidebar-container">
      <div className="profile-sidebar-card">
        {/* Blue Banner - EVEN DARKER BLUE WITH GRADIENT */}
        <div className="profile-sidebar-banner">
          {/* Banner is just for color, no content */}
        </div>

        {/* Username Section - UNDER the banner */}
        <div className="profile-sidebar-username-section">
          <h2 className="profile-sidebar-username">{user.username || "Purrple_Colouds"}</h2>

          {/* Share Button - UNDER username - DARKER GREY NO BORDER */}
          <button
            className="profile-sidebar-share-btn"
            onClick={handleShareProfile}
          >
            <span className="profile-sidebar-share-btn-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
            </span>
            Share
          </button>
        </div>

        {/* Followers Count - Fixed font and color - LEFT ALIGNED - NO DIVIDER */}
        <div className="profile-sidebar-followers-section">
          <div className="profile-sidebar-followers-stat">
            <span className="profile-sidebar-followers-count">{followersCount}</span>
            <span className="profile-sidebar-followers-label">Followers</span>
          </div>
        </div>

        {/* Karma & Contributions Section - LEFT ALIGNED - NO DIVIDER */}
        <div className="profile-sidebar-karma-section">
          <div className="profile-sidebar-karma-stat">
            <div className="profile-sidebar-karma-value-container">
              <span className="profile-sidebar-karma-value">{formatKarmaWithCommas(karma)}</span>
              <span className="profile-sidebar-karma-label">Karma</span>
            </div>
          </div>

          <div className="profile-sidebar-contributions-stat">
            <div className="profile-sidebar-contributions-value-container">
              <span className="profile-sidebar-contributions-value">{formatKarmaWithCommas(contributions)}</span>
              <span className="profile-sidebar-contributions-label">Contributions</span>
            </div>
          </div>
        </div>

        {/* Reddit Age & Active Status - LEFT ALIGNED - NO DIVIDER */}
        <div className="profile-sidebar-age-section">
          <div className="profile-sidebar-age-stat">
            <span className="profile-sidebar-age-label">Reddit Age</span>
            <span className="profile-sidebar-age-value">5 y</span>
          </div>

          <div className="profile-sidebar-active-stat">
            <span className="profile-sidebar-active-label">Active in</span>
            <span className="profile-sidebar-active-value">&gt;39</span>
          </div>
        </div>

        {/* Gold Section - LEFT ALIGNED - NO DIVIDER */}
        <div className="profile-sidebar-gold-section">
          <div className="profile-sidebar-gold-stat">
            <span className="profile-sidebar-gold-label">Gold earned</span>
            <span className="profile-sidebar-gold-value">0</span>
          </div>
        </div>

        {/* Follow Button - For non-own profiles - LEFT ALIGNED */}
        {!isOwnProfile && (
          <div className="profile-sidebar-follow-section">
            <button
              className={`profile-sidebar-follow-btn ${isFollowing ? 'profile-sidebar-following' : ''}`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        )}

        {/* Settings Section - For own profile */}
        {isOwnProfile && (
          <div className="profile-sidebar-settings-section">
            <h3 className="profile-sidebar-settings-title">SETTINGS</h3>

            <div className="profile-sidebar-settings-item">
              <div className="profile-sidebar-settings-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="profile-sidebar-settings-item-content">
                <span className="profile-sidebar-settings-item-title">Profile</span>
                <span className="profile-sidebar-settings-item-description">Customize your profile</span>
              </div>
              <button className="profile-sidebar-settings-update-btn">Update</button>
            </div>

            <div className="profile-sidebar-settings-item">
              <div className="profile-sidebar-settings-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div className="profile-sidebar-settings-item-content">
                <span className="profile-sidebar-settings-item-title">Curate your profile</span>
                <span className="profile-sidebar-settings-item-description">Manage what people see when they visit your profile</span>
              </div>
              <button className="profile-sidebar-settings-update-btn">Update</button>
            </div>

            <div className="profile-sidebar-settings-item">
              <div className="profile-sidebar-settings-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                </svg>
              </div>
              <div className="profile-sidebar-settings-item-content">
                <span className="profile-sidebar-settings-item-title">Avatar</span>
                <span className="profile-sidebar-settings-item-description">Style your avatar</span>
              </div>
              <button className="profile-sidebar-settings-update-btn">Update</button>
            </div>

            <div className="profile-sidebar-settings-item">
              <div className="profile-sidebar-settings-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"></path>
                </svg>
              </div>
              <div className="profile-sidebar-settings-item-content">
                <span className="profile-sidebar-settings-item-title">Mod Tools</span>
                <span className="profile-sidebar-settings-item-description">Moderate your profile</span>
              </div>
              <button className="profile-sidebar-settings-update-btn">Update</button>
            </div>
          </div>
        )}

        <div className="profile-sidebar-custom-feeds">
          <h3 className="profile-sidebar-section-title">Custom Feeds</h3>

          {customFeeds.length === 0 ? (
            <span className="feed-empty">No custom feeds yet</span>
          ) : (
            customFeeds.map(feed => (
              <Link
                key={feed._id}
                to={`/f/${feed._id}`} // <-- navigate to feed page
                className="profile-sidebar-custom-feed-item"
                style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={feed.image}
                  alt={feed.name}
                  className="profile-sidebar-custom-feed-image"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                />
                <span className="feed-name">{feed.name}</span>

                {feed.isPrivate && (
                  <img
                    src="../images/lock.svg"
                    alt="Private"
                    style={{
                      width: "12px",
                      marginLeft: "5px",
                      filter: document.documentElement.getAttribute('data-theme') === 'dark'
                        ? 'invert(1) brightness(1.5)'
                        : 'none'
                    }}
                  />
                )}
              </Link>
            ))
          )}
        </div>



      </div>
    </div>
  );
}

export default ProfileSidebar;