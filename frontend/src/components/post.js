import React, { useState } from "react";
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

const handleUpvote = async () => {
  let newVoteValue;

  if (vote === 1) newVoteValue = 0;      // Remove upvote
  else newVoteValue = 1;                 // Add upvote (or switch from downvote)

  updateVote(newVoteValue);
};

const handleDownvote = async () => {
  let newVoteValue;

  if (vote === -1) newVoteValue = 0;    // Remove downvote
  else newVoteValue = -1;                // Add downvote (or switch from upvote)

  updateVote(newVoteValue);
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

    // update state only after backend confirms
    setVote(newVoteValue);
    setVoteCount(data.score);

  } catch (err) {
    console.error(err);
  }
};

  const imageStyle = { borderRadius: '50%', width: '20px', height: '20px', marginRight: '8px' };
  const showCommunityMeta = isAllFeed || (!isCommunityPage && community);

  return (
    <div className={`post-fullwidth ${viewType === 'compact' ? 'compact-view' : ''}`}>
      <div className="post">

        {/* POST HEADER/META SECTION */}
        <div className="post-meta">
          <Link
            to={isCommunityPage ? (username ? `/profile/${username}` : "#") : `/community/${community}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
          >
            <div className="post-user-info">
              
              {/* 1. Community Feed / All Feed Logic */}
              {showCommunityMeta ? ( 
                <>
                  <img src={communityAvatarUrl || "../images/default-community.svg"} alt="Community Avatar" style={imageStyle} />
                  <span className="post-community-name">r/{community}</span>
                  {/* Show author and time */}
                  <span className="post-separator-meta post-separator">
                    • Posted by u/{username}
                  </span>
                  <div className="post-created-at post-separator-meta"> 
                    • {
                      (() => {
                        const parsedTime = new Date(time);
                        return !time || isNaN(parsedTime)
                          ? 'Unknown time'
                          : formatDistanceToNow(parsedTime, { addSuffix: true }).replace(/^about /, '');
                      })()
                    }
                  </div>
                </>
              ) : (
                /* 2. Community Page / Profile View Logic */
                <>
                  <img src={avatar} alt="User Avatar" style={imageStyle} />
                  <span className="post-user-name">u/{username}</span>
                  <div className="post-created-at post-separator-meta">
                    • {
                      (() => {
                        const parsedTime = new Date(time);
                        return !time || isNaN(parsedTime)
                          ? 'Unknown time'
                          : formatDistanceToNow(parsedTime, { addSuffix: true }).replace(/^about /, '');
                      })()
                    }
                  </div>
                </>
              )}
            </div>
          </Link>
          
         {isAllFeed && ( 
            <div className="post-meta-actions">
              <button 
                className={`post-join-button ${isJoined ? 'joined' : 'not-joined'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); 
                  if(onToggleJoin) onToggleJoin(community); 
                }}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
              <img src="../images/three-dots.svg" alt="More options" className="post-meta-dots" />
            </div>
          )}
          
          {(!isAllFeed && !isCommunityPage) && ( // Show only dots on Home Feed
            <div className="post-meta-actions">
              <img src="../images/three-dots.svg" alt="More options" className="post-meta-dots" />
            </div>
          )}

          {isCommunityPage && ( // Show only dots on Community Page
            <div className="post-meta-actions">
              <img src="../images/three-dots.svg" alt="More options" className="post-meta-dots" />
            </div>
          )}
          
        </div>

        <Link
          to={postId ? `/post/${postId}` : "#"}
          className="post-link"
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <h2 className="post-header">{title}</h2>
          
          {/* POST PREVIEW / MEDIA (conditionally render based on viewType) */}
          {viewType !== 'compact' && ( // <-- HIDE MEDIA IN COMPACT VIEW
              preview ? (
                <div className="post-preview">
                  {/* ... media content ... */}
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

        <div className="post-activity-wrapper">
            <div className="post-activity">
                <div className="post-vote post-activity-container">
                    <div className="post-activity-button" onClick={handleUpvote}>
                        <img
                            src={vote === 1 ? "../images/upvote-active.svg" : "../images/upvote.svg"}
                            alt="upvote"
                        />
                    </div>
                    <span className="post-vote-score">{voteCount}</span>
                    <div className="post-activity-button" onClick={handleDownvote}>
                        <img
                            src={vote === -1 ? "../images/downvote-active.svg" : "../images/downvote.svg"}
                            alt="downvote"
                        />
                    </div>
                </div>

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