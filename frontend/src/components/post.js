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
  initialComments,
  community,
  isAllFeed,           
  communityAvatarUrl,  
  isJoined,            
  onToggleJoin,        
}) {
  const [voteCount, setVoteCount] = useState(initialVotes || 0);
  const [vote, setVote] = useState(0); 
  const [comments, setComments] = useState(initialComments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("")

  const handleUpvote = () => {
    if (vote === 1) {
      // If already upvoted, remove the upvote
      setVote(0);
      setVoteCount((prev) => prev - 1);
    } else if (vote === -1) {
      // If downvoted, switch to upvote (remove downvote and add upvote)
      setVote(1);
      setVoteCount((prev) => prev + 2); // +1 to remove downvote, +1 to add upvote
    } else {
      // If no vote, add upvote
      setVote(1);
      setVoteCount((prev) => prev + 1);
    }
  };

  const handleDownvote = () => {
    if (vote === -1) {
      // If already downvoted, remove the downvote
      setVote(0);
      setVoteCount((prev) => prev + 1);
    } else if (vote === 1) {
      // If upvoted, switch to downvote (remove upvote and add downvote)
      setVote(-1);
      setVoteCount((prev) => prev - 2); // -1 to remove upvote, -1 to add downvote
    } else {
      // If no vote, add downvote
      setVote(-1);
      setVoteCount((prev) => prev - 1);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    const newC = { username: "You", text: newComment };
    setComments([...comments, newC]);
    setNewComment("");
  };

  const imageStyle = { borderRadius: '50%', width: '20px', height: '20px', marginRight: '8px' };

  return (
    <div className="post-fullwidth">
      <div className="post">

        {/* POST HEADER/META SECTION */}
        <div className="post-meta">
          <Link
            to={isAllFeed ? `/community/${community}` : (username ? `/profile/${username}` : "#")}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
          >
            <div className="post-user-info">
              {/* Display community info in Custom/All Feed */}
              {isAllFeed ? (
                <>
                  <img src={communityAvatarUrl || "../images/default-community.svg"} alt="Community Avatar" style={imageStyle} />
                  <span className="post-community-name">r/{community}</span>
                  {/* FIX: Add the author and time display next to the community */}
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
                // This section remains for direct user profile/standard community views
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
                  if(onToggleJoin) onToggleJoin(community); // The handler now receives communityName and ID from parent
                }}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
              {/* Optional: Add a 3-dot menu or other actions here */}
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
          
          {preview ? (
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
                    <span className="post-comment-amount">{comments.length}</span>
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}

export default Post;