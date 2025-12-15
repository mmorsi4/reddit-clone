import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ProfileComment({ comment, user, allCommunities = [] }) {
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [communityAvatar, setCommunityAvatar] = useState("/images/avatar.png");
  const [communityName, setCommunityName] = useState("unknown");

  useEffect(() => {
    // Calculate score
    if (comment.score !== undefined) {
      setCalculatedScore(comment.score);
    } else if (comment.votes && Array.isArray(comment.votes)) {
      const score = comment.votes.reduce((total, vote) => {
        return total + (vote.value || 0);
      }, 0);
      setCalculatedScore(score);
    }

    // Find community from allCommunities
    const findCommunity = () => {
      // Try to get community name from various sources
      const possibleCommunityName = 
        comment.post?.community?.name || 
        comment.post?.communityName || 
        "unknown";
      
      // Find the community by name (case-insensitive)
      const foundCommunity = allCommunities.find(c => 
        c.name && c.name.toLowerCase() === possibleCommunityName.toLowerCase()
      );
      
      if (foundCommunity) {
        console.log(`Found community "${foundCommunity.name}"`, {
          avatar: foundCommunity.avatar,
          avatarType: foundCommunity.avatar?.startsWith('data:') ? 'data-url' : 'file-url',
          fromAllCommunities: true
        });
        return foundCommunity;
      }
      
      return null;
    };

    const community = findCommunity();
    
    if (community) {
      setCommunityName(community.name);
      
      // Check if avatar is valid - UPDATED TO ACCEPT DATA URLs
      if (community.avatar && 
          community.avatar !== "undefined" && 
          community.avatar !== "null" &&
          community.avatar.trim() !== "") {
        
        // Data URLs are valid! (e.g., data:image/jpeg;base64,...)
        if (community.avatar.startsWith("data:")) {
          console.log(`Community "${community.name}" has data URL avatar, using it`);
          setCommunityAvatar(community.avatar);
        } 
        // Regular file URLs (e.g., /images/avatar.jpg)
        else if (community.avatar.startsWith("/") || community.avatar.startsWith("http")) {
          setCommunityAvatar(community.avatar);
        }
        // If it's just a filename, prepend /images/
        else {
          setCommunityAvatar(`/images/${community.avatar}`);
        }
      } else {
        console.log(`Community "${community.name}" has no avatar, using default`);
        setCommunityAvatar("/images/avatar.png");
      }
    } else {
      // Use the name from post as fallback
      const nameFromPost = comment.post?.community?.name || "unknown";
      setCommunityName(nameFromPost);
    }
  }, [comment, allCommunities]);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "just now";
    
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const postTitle = comment.post?.title || "a post";
  const postId = comment.post?._id;

  return (
    <div className="profile-comment-card">
      {/* Community header with avatar */}
      <div className="profile-comment-header">
        <div className="profile-comment-community">
          <img 
            src={communityAvatar}
            alt={`r/${communityName}`}
            className="profile-comment-community-avatar"
            onError={(e) => {
              console.warn(`Avatar failed for ${communityName}:`, communityAvatar);
              // Don't try to fix data URLs - they should work
              if (!communityAvatar.startsWith('data:')) {
                e.target.src = "/images/avatar.png";
              }
              // If that fails too, show text fallback
              e.target.onerror = () => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'community-avatar-fallback';
                fallback.textContent = communityName.charAt(0).toUpperCase();
                e.target.parentNode.appendChild(fallback);
              };
            }}
          />
          <div className="profile-comment-community-info">
            <Link 
              to={`/r/${communityName}`}
              className="profile-comment-community-name"
            >
              r/{communityName}
            </Link>
            <div className="profile-comment-meta">
              <span className="profile-comment-author">
                u/{comment.author?.username || user?.username || "user"}
              </span>
              <span className="profile-comment-time">
                • {getTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment body */}
      <div className="profile-comment-body">
        {comment.body || comment.text}
      </div>

      {/* Post context */}
      <div className="profile-comment-post-context">
        <span className="profile-comment-post-text">
          Commented on: 
          {postId && communityName !== "unknown" ? (
            <Link 
              to={`/r/${communityName}/comments/${postId}`}
              className="profile-comment-post-link"
            >
              "{postTitle}"
            </Link>
          ) : (
            <span className="profile-comment-post-title">"{postTitle}"</span>
          )}
        </span>
      </div>

      {/* Comment stats */}
      <div className="profile-comment-stats">
        <div className="profile-comment-stat">
          <span className="profile-comment-stat-count">
            {calculatedScore}
          </span>
          <span className="profile-comment-stat-text">
            points
          </span>
        </div>
        <div className="profile-comment-stat">
          <span className="profile-comment-stat-count">
            {comment.replies?.length || 0}
          </span>
          <span className="profile-comment-stat-text">
            replies
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProfileComment;