import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';

function Post({
  postId,
  username,
  time,
  title,
  preview,
  textPreview,
  avatar,
  initialVotes,
  initialVote,
  initialComments,
  community,
  isAllFeed,
  communityAvatarUrl,
  isJoined,
  onToggleJoin,
  viewType,
  isCommunityPage,
}) {
  const [voteCount, setVoteCount] = useState(initialVotes || 0);
  const [vote, setVote] = useState(initialVote || 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let newVoteValue;
    if (vote === 1) newVoteValue = 0;
    else newVoteValue = 1;

    await updateVote(newVoteValue);
  };

  const handleDownvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let newVoteValue;
    if (vote === -1) newVoteValue = 0;
    else newVoteValue = -1;

    await updateVote(newVoteValue);
  };

  const updateVote = async (newVoteValue) => {
    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: newVoteValue }),
      });

      if (!res.ok) throw new Error("Vote failed");

      const data = await res.json();
      setVote(newVoteValue);
      setVoteCount(data.score);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleMenuAction = (action, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${action} clicked for post ${postId}`);
    closeMenu();
  };

  const handleJoinClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleJoin) onToggleJoin(community);
  };

  const imageStyle = { 
    borderRadius: '50%', 
    width: '20px', 
    height: '20px', 
    marginRight: '8px' 
  };

  const showCommunityMeta = isAllFeed || (!isCommunityPage && community);
  
  // Format time display
  const formattedTime = !time || isNaN(new Date(time)) 
    ? 'Unknown time' 
    : formatDistanceToNow(new Date(time), { addSuffix: true }).replace(/^about /, '');

  return (
    <div className={`post-fullwidth ${viewType === 'compact' ? 'compact-view' : ''}`}>
      <div className="post">
        {/* POST HEADER/META SECTION */}
        <div className="post-meta">
          <div className="post-user-info-container">
            <Link
              to={isCommunityPage ? (username ? `/profile/${username}` : "#") : `/community/${community}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
            >
              <div className="post-user-info">
                {showCommunityMeta ? (
                  <>
                    <img 
                      src={communityAvatarUrl || "../images/default-community.svg"} 
                      alt="Community Avatar" 
                      style={imageStyle} 
                    />
                    <span className="post-community-name">r/{community}</span>
                    <span className="post-separator-meta post-separator">
                      • Posted by u/{username}
                    </span>
                    <div className="post-created-at post-separator-meta">
                      • {formattedTime}
                    </div>
                  </>
                ) : (
                  <>
                    <img src={avatar} alt="User Avatar" style={imageStyle} />
                    <span className="post-user-name">u/{username}</span>
                    <div className="post-created-at post-separator-meta">
                      • {formattedTime}
                    </div>
                  </>
                )}
              </div>
            </Link>
          </div>

          {/* ACTIONS SECTION */}
          <div className="post-meta-actions">
            {isAllFeed && (
              <button
                className={`post-join-button ${isJoined ? 'joined' : 'not-joined'}`}
                onClick={handleJoinClick}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
            )}
            
            {/* THREE DOTS MENU - ALWAYS VISIBLE BUT CONDITIONAL POSITION */}
            <div className="post-dots-wrapper" ref={menuRef}>
              <button
                className="post-meta-dots-button"
                onClick={toggleMenu}
                aria-label="More options"
              >
                <img
                  src="../images/three-dots.svg"
                  alt="More options"
                  className="post-meta-dots"
                />
              </button>

              {menuOpen && (
                <div className="post-dots-menu" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="post-dots-item"
                    onClick={(e) => handleMenuAction('save', e)}
                  >
                    <img src="../images/save.svg" alt="Save" />
                    <span>Save</span>
                  </button>
                  <button 
                    className="post-dots-item"
                    onClick={(e) => handleMenuAction('hide', e)}
                  >
                    <img src="../images/hide.svg" alt="Hide" />
                    <span>Hide</span>
                  </button>
                    
                </div>
              )}
            </div>
          </div>
        </div>

        {/* POST CONTENT */}
        <Link
          to={postId ? `/post/${postId}` : "#"}
          className="post-link"
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <h2 className="post-header">{title}</h2>

          {viewType !== 'compact' && (
            preview ? (
              <div className="post-preview">
                {preview.endsWith(".mp4") || preview.endsWith(".webm") ? (
                  <video src={preview} controls className="post-media" />
                ) : (
                  <img src={preview} alt="preview" className="post-media" />
                )}
              </div>
            ) : (
              <div className="post-preview">
                <p>{textPreview}</p>
              </div>
            )
          )}
        </Link>

        {/* POST ACTIVITIES (VOTES, COMMENTS) */}
        <div className="post-activity-wrapper">
          <div className="post-activity">
            {/* VOTING */}
            <div className="post-vote post-activity-container">
              <button 
                className="post-activity-button"
                onClick={handleUpvote}
                aria-label="Upvote"
              >
                <img
                  src={vote === 1 ? "../images/upvote-active.svg" : "../images/upvote.svg"}
                  alt="upvote"
                />
              </button>
              <span className="post-vote-score">{voteCount}</span>
              <button 
                className="post-activity-button"
                onClick={handleDownvote}
                aria-label="Downvote"
              >
                <img
                  src={vote === -1 ? "../images/downvote-active.svg" : "../images/downvote.svg"}
                  alt="downvote"
                />
              </button>
            </div>

            {/* COMMENTS */}
            <Link
              to={postId ? `/post/${postId}` : "#"}
              className="post-comment post-activity-button post-activity-container"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img src="../images/comment.svg" alt="comment" />
              <span className="post-comment-amount">{initialComments}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;