import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import CommentWithVotes from "../components/CommentWithVotes";

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data.post);
        setComments(data.comments || []);
      } catch (err) {
        console.error(err);
        setPost(null);
      }
    }

    fetchPost();
  }, [postId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updated = [...comments, { author: { username: "You" }, text: newComment }];
    setComments(updated);
    setNewComment("");
    // You can also POST to backend here to save permanently
  };

  if (!post) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Post not found</h2>;

  return (
    <>
      <Header />
      <Sidebar />
      <div className="post-page">
        <div className="post-page-header">
          <Link
            to={post.community?.title ? `/community/${post.community.title}` : "/home"}
          >
            &larr; Back to r/{post.community?.name || "community"}
          </Link>
        </div>

        <div className="post-page-content">
          <div className="post-page-meta">
            <img src={post.author.avatar} alt="avatar" className="post-page-avatar" />
            <div className="post-page-user-info">
              <span className="post-page-username">u/{post.author.username}</span>
              <span className="post-page-community">• r/{post.community.name}</span>
              <span className="post-page-time">• {new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <h2 className="post-page-title">{post.title}</h2>

          {post.mediaUrl ? (
            <img src={post.mediaUrl} alt="post preview" className="post-page-image" />
          ) : (
            <p className="post-page-text">{post.body || "No content available."}</p>
          )}

          {/* Comments */}
          <div className="post-comments-section">
            <h3>Comments</h3>
            <div className="post-comments-container">
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>No comments yet...</p>
                ) : (
                  comments.map((c, i) => (
                    <CommentWithVotes key={i} username={c.author.username} text={c.text} />
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