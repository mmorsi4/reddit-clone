import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import postsDB from "../data/postsDB";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import Header from "../components/header"
import CommentWithVotes from "../components/CommentWithVotes";

function PostPage() {
  const { communityName, postTitle } = useParams();
  const decodedTitle = decodeURIComponent(postTitle);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const found = postsDB.find(
      (p) =>
        p.community.toLowerCase() === communityName.toLowerCase() &&
        p.title.toLowerCase() === decodedTitle.toLowerCase()
    );

    if (found) {
      setPost(found);

      const savedComments =
        JSON.parse(localStorage.getItem(`comments_${communityName}_${decodedTitle}`)) ||
        found.initialComments ||
        [];
      setComments(savedComments);
    }
  }, [communityName, decodedTitle]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updated = [...comments, { username: "You", text: newComment }];
    setComments(updated);
    setNewComment("");

    // 💾 Save to localStorage
    localStorage.setItem(
      `comments_${communityName}_${decodedTitle}`,
      JSON.stringify(updated)
    );
  };

  if (!post) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Post not found</h2>;
  }

  return (
    <>
      <head>
        <base href="/" />
      </head>
      <Header />
      <Sidebar />
      <div className="post-page">
        {/* Back link */}
        <div className="post-page-header">
          <Link to={`/community/${communityName}`}>&larr; Back to r/{communityName}</Link>
        </div>

        {/* Post Content */}
        <div className="post-page-content">
          <div className="post-page-meta">
            <img src={post.avatar} alt="avatar" className="post-page-avatar" />
            <div className="post-page-user-info">
              <span className="post-page-username">u/{post.username}</span>
              <span className="post-page-community">• r/{post.community}</span>
              <span className="post-page-time">• {post.time}</span>
            </div>
          </div>

          <h2 className="post-page-title">{post.title}</h2>

          {post.preview && post.preview.endsWith(".png") ? (
            <img src={post.preview} alt="post preview" className="post-page-image" />
          ) : (
            <p className="post-page-text">
              {post.preview || post.textPreview || "No content available."}
            </p>
          )}

          {/* 🗨️ COMMENT SECTION */}
          <div className="post-comments-section">
            <h3>Comments</h3>
            <div className="post-comments-container">
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>No comments yet...</p>
                ) : (
                  comments.map((c, i) => (
                    <CommentWithVotes key={i} username={c.username} text={c.text} />
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
          </div>

        </div>
      </div>
    </>
  );
}

export default PostPage;