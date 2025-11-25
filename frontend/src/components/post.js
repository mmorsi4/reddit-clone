import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns'; // to have date in ago form

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
}) {
  const [voteCount, setVoteCount] = useState(initialVotes || 0);
  const [vote, setVote] = useState(0);
  const [comments, setComments] = useState(initialComments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleUpvote = () => {
    if (vote === 1) {
      setVote(0);
      setVoteCount((prev) => Math.max(0, prev - 1));
    } else {
      const change = vote === -1 ? 2 : 1;
      setVote(1);
      setVoteCount((prev) => prev + change);
    }
  };

  const handleDownvote = () => {
    if (vote === -1) {
      setVote(0);
    } else {
      if (vote === 1) {
        setVoteCount((prev) => Math.max(0, prev - 2));
      } else {
        setVoteCount((prev) => Math.max(0, prev - 1));
      }
      setVote(-1);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    const newC = { username: "You", text: newComment };
    setComments([...comments, newC]);
    setNewComment("");
  };

  return (
    <div className="post-fullwidth">
      <div className="post">

        {/* MAIN CLICKABLE AREA */}
          <div className="post-meta">

            <Link
            to={username ? `/profile/${username}` : "#"}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="post-user-info">
                <img src={avatar} alt="avatar" />
                <span className="post-user-name">u/{username}</span>
              </div>
            </Link>

            <div className="post-created-at">
              • {
                (() => {
                  const parsedTime = new Date(time);
                  return !time || isNaN(parsedTime)
                    ? 'Unknown time'
                    : formatDistanceToNow(parsedTime, { addSuffix: true }).replace(/^about /, '');
                })()
              }
            </div>

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

        {/* ACTIVITY SECTION */}
        <div className="post-activity">
          {/* VOTE SECTION */}
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

          {/* COMMENTS BUTTON */}
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
  );
}

export default Post;