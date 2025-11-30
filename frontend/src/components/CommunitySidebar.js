// components/CommunitySidebar.jsx
import React, { useState, useEffect } from 'react';
import '../styles/CommunitySidebar.css';

const CommunitySidebar = ({ communityId, post, currentUser, showJoinButton = true }) => {
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [communityStats, setCommunityStats] = useState(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        console.log("Fetching community data for:", communityId);
        
        const res = await fetch('http://localhost:5001/api/communities', {
          credentials: "include"
        });
        
        if (res.ok) {
          const communities = await res.json();
          const foundCommunity = communities.find(c => 
            c._id === communityId || c.name === post?.community?.name
          );
          
          if (foundCommunity) {
            setCommunity(foundCommunity);
            
            // Generate realistic stats based on your models
            const stats = {
              memberCount: Math.floor(Math.random() * 50000) + 5000, // 5k-55k members
              onlineCount: Math.floor(Math.random() * 500) + 50,     // 50-550 online
              postCount: Math.floor(Math.random() * 10000) + 1000,   // 1k-11k posts
              rules: [
                { id: 1, title: "Remember the human", description: "" },
                { id: 2, title: "Behave like you would in real life", description: "" },
                { id: 3, title: "Look for the original source of content", description: "" },
                { id: 4, title: "Search for duplicates before posting", description: "" },
                { id: 5, title: "Read the community's rules", description: "" }
              ],
              userFlair: "Code Enthusiast", // Example user flair
            };
            
            setCommunityStats(stats);
            
            // Check if user is a member
            const memberRes = await fetch('http://localhost:5001/api/communities/joined', {
              credentials: "include"
            });
            
            if (memberRes.ok) {
              const joinedCommunities = await memberRes.json();
              const isUserMember = joinedCommunities.some(jc => jc._id === foundCommunity._id);
              setIsMember(isUserMember);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch community:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId || post?.community) {
      fetchCommunityData();
    } else {
      setIsLoading(false);
    }
  }, [communityId, post]);

  // Debug current user data
  console.log("Current User in Sidebar:", currentUser);
  console.log("User avatarUrl:", currentUser?.avatarUrl);
  console.log("User username:", currentUser?.username);

  const handleJoinCommunity = async () => {
    // TODO: Implement join/leave community functionality
    console.log(`${isMember ? 'Leaving' : 'Joining'} community:`, community?.name);
    setIsMember(!isMember);
  };

  if (isLoading) {
    return (
      <div className="community-sidebar loading">
        <div className="loading-spinner-small"></div>
        <p>Loading community...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="community-sidebar error">
        <p>Community not found</p>
      </div>
    );
  }

  return (
    <div className="community-sidebar">
      {/* Header with community name and join button - BLACK & WHITE */}
      <div className="sidebar-header">
        <div className="community-header-main">
          <div className="community-title-section">
            <h2 className="community-name">r/{community.name}</h2>
          </div>
        </div>
        {showJoinButton && (
          <button 
            className={`join-btn ${isMember ? 'joined' : ''}`}
            onClick={handleJoinCommunity}
          >
            {isMember ? 'Joined' : 'Join'}
          </button>
        )}
      </div>
      <div className="sidebar-section community-description-section">
  <p className="community-description-text">
    {community.description || "A friendly community for programming enthusiasts to share knowledge, ask questions, and discuss all things code!"}
  </p>
</div>

      {/* Stats Section - BLACK & WHITE */}
      {communityStats && (
        <div className="sidebar-section stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{communityStats.memberCount.toLocaleString()}</div>
              <div className="stat-label">Members</div>
            </div>
            <div className="stat-item online-stat">
              <div className="stat-number">
                <span className="online-dot"></span>
                {communityStats.onlineCount.toLocaleString()}
              </div>
              <div className="stat-label">Online</div>
            </div>
          </div>
          <div className="community-created">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#787c7e">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* User Flair Section - BLACK & WHITE */}
      <div className="sidebar-section user-flair-section">
        <div className="section-title">USER FLAIR PREVIEW</div>
        <div className="user-flair-preview">
          <div className="user-avatar">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="User avatar" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="flair-content">
            <div className="username">u/{currentUser?.username || 'your_username'}</div>
            <div className="flair-tag">{communityStats?.userFlair}</div>
          </div>
        </div>
      </div>

      {/* Community Bookmark Section - BLACK & WHITE */}
      <div className="sidebar-section bookmark-section">
        <div className="section-title">COMMUNITY BOOKMARK</div>
        <button className="community-bookmark-btn">
          Info
        </button>
      </div>

      {/* Rules Section - BLACK & WHITE */}
      {communityStats?.rules && communityStats.rules.length > 0 && (
        <div className="sidebar-section rules-section">
          <div className="section-title">r/{community.name} RULES</div>
          <div className="rules-list">
            {communityStats.rules.slice(0, 4).map((rule) => (
              <div key={rule.id} className="rule-item">
                <div className="rule-number">{rule.id}.</div>
                <div className="rule-text">{rule.title}</div>
              </div>
            ))}
          </div>
          <button className="see-all-rules-btn">See All</button>
        </div>
      )}

      {/* About Section - BLACK & WHITE */}
      <div className="sidebar-section about-section">
        <div className="section-title">ABOUT COMMUNITY</div>
        <div className="about-content">
          <p className="about-description">
            {community.description || "A community for discussing all things related to programming and technology."}
          </p>
          <div className="about-links">
            <a href="#" className="about-link">Community Description</a>
            <a href="#" className="about-link">Official Discord</a>
            <a href="#" className="about-link">Related Communities</a>
            <a href="#" className="about-link">Community Resources</a>
          </div>
        </div>
      </div>

      {/* Repost Warning Section - BLACK & WHITE */}
      <div className="sidebar-section repost-section">
        <div className="section-title">REPOST GUIDELINES</div>
        <div className="repost-content">
          <p className="repost-warning">
            Reposting content without proper attribution is not allowed. Please ensure you credit the original creator and check if the content has been posted recently.
          </p>
          <div className="repost-links">
            <a href="#" className="repost-link">Reposting Policy</a>
            <a href="#" className="repost-link">Content Guidelines</a>
          </div>
        </div>
      </div>

      {/* Message Mods Section - BLACK & WHITE */}
      <div className="sidebar-section message-mods-section">
        <div className="section-title">MODERATION</div>
        <button className="message-mods-main-btn">
          Message the Mods
        </button>
      </div>

      {/* Moderators Section - BLACK & WHITE */}
      <div className="sidebar-section moderators-section">
        <div className="moderators-header">
          <div className="section-title">MODERATORS</div>
          <button className="view-moderators-btn">
            View All
          </button>
        </div>
        <div className="moderators-grid">
          <div className="moderator-item">
            <span className="moderator-name">u/admin_user</span>
          </div>
          <div className="moderator-item">
            <span className="moderator-name">u/tech_guru</span>
          </div>
          <div className="moderator-item">
            <span className="moderator-name">u/code_wizard</span>
          </div>
          <div className="moderator-item">
            <span className="moderator-name">u/community_helper</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySidebar;