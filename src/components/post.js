import React, { useState } from "react";

function Post({ username, time, title, preview, textPreview, avatar, initialVotes = 0, initialComments = [] }) {
  const [voteCount, setVoteCount] = useState(initialVotes);
  const [vote, setVote] = useState(0);
  const [comments, setComments] = useState(initialComments);
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
    <div className="post-container">
      <div className="post">
        <div className="post-meta">
          <div className="post-user-info">
            <img src={avatar} alt="avatar" />
            <span className="post-user-name">u/{username}</span>
          </div>
          <div className="post-created-at">• {time}</div>
        </div>

        <h2 className="post-header">{title}</h2>

        {preview ? (
          <div className="post-preview">
            <img src={preview} alt="preview" />
          </div>
        ) : (
          <div className="post-preview">
            <p>{textPreview}</p>
          </div>
        )}

        <div className="post-activity">
          {/* 🟢 VOTE SECTION */}
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

          {/* 💬 COMMENTS */}
          <div
            className="post-comment post-activity-button post-activity-container"
            onClick={() => setShowComments(!showComments)}
          >
            <img src="../images/comment.svg" alt="comment" />
            <span className="post-comment-amount">{comments.length}</span>
          </div>

          {/* 🔗 SHARE */}
          <div className="post-share post-activity-button post-activity-container">
            <img src="../images/share.svg" alt="share" />
            <span>Share</span>
          </div>
        </div>

        {/* 🗨️ COMMENT SECTION */}
        {showComments && (
          <div className="post-comments-container">
            <div className="comments-list">
              {comments.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No comments yet...</p>
              ) : (
                comments.map((c, i) => (
                  <p key={i}>
                    <strong>u/{c.username}</strong>: {c.text}
                  </p>
                ))
              )}
            </div>

            <div className="add-comment">
              <input
                type="text"
                placeholder="Add a comment..."
                className="comment-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button className="comment-submit" onClick={handleAddComment}>
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Post;
