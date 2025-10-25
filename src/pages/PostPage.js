import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import postsDB from "../data/postsDB";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
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
      <div className="header">
        <a>
          <img src="../images/reddit-logo.png" className="reddit-logo" />
        </a>

        <SearchBar />

        <ul className="header-actions">
          <li className="header-action">
            <button>
              <img src="../images/ads.svg" />
              <div className="header-action-tooltip">
                Advertise on Reddit
              </div>
            </button>
          </li>
          <li className="header-action">
            <button>
              <a href="./chats.html" className="header-action-link">
                <img src="../images/chat.svg" />
                <div className="header-action-tooltip">
                  Open chat
                </div>
              </a>
            </button>
          </li>
          <li className="header-action">
            <Link to="/create_post" className="header-action-link">
              <img src="../images/create-post.svg" /> Create
              <div className="header-action-tooltip">
                Create post
              </div>
            </Link>
          </li>
          <li className="header-action">
            <button className="inbox-button">
              <img src="../images/open-inbox.svg" />
              <div className="notification-counter">1</div>
              <div className="header-action-tooltip">
                Open inbox
              </div>
            </button>
          </li>
          <li className="header-action">
            <button className="profile-menu-button">
              <label for="profile-menu-visibility-checkbox">
                <img src="../images/avatar.png" className="header-action-avatar" />
              </label>
              <div className="online-indicator"></div>
              <div className="header-action-tooltip">
                Open profile menu
              </div>
            </button>
            <input type="checkbox" className="profile-menu-visibility" id="profile-menu-visibility-checkbox" />
            <ul className="profile-menu">
              <li className="profile-menu-item">
                <Link to="/viewprofile" className="header-action-link">
                  <div className="profile-menu-item-left">
                    <img src="../images/avatar.png"
                      className="profile-menu-item-icon profile-menu-item-icon-avatar" />
                    <div className="online-indicator online-indicator-profile-menu"></div>
                  </div>
                  <div className="profile-menu-item-right">
                    <div className="profile-menu-item-title">
                      View Profile
                    </div>
                    <div className="profile-menu-item-info-extra">

                    </div>
                  </div>
                </Link>
              </li>
              <li className="profile-menu-item">
                <Link to="/edit-avatar" className="header-action-link">
                  <div className="profile-menu-item-icon">
                    <img src="../images/edit-avatar.svg" />
                  </div>
                  <div className="profile-menu-item-info">
                    <div className="profile-menu-item-title">
                      Edit Avatar
                    </div>
                  </div>
                </Link>
              </li>
              <li className="profile-menu-item">
                <div className="profile-menu-item-icon">
                  <img src="../images/achievements.svg" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">
                    Achievements
                  </div>
                  <div className="profile-menu-item-info-extra">
                    3 unlocked
                  </div>
                </div>
              </li>
              <li className="profile-menu-item">
                <div className="profile-menu-item-icon">
                  <img src="../images/dark-mode.svg" />
                </div>
                <div className="profile-menu-item-info">
                  <div className="profile-menu-item-title">
                    Dark Mode
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </li>
              <li className="profile-menu-item" style={{ cursor: "pointer" }}>
                <Link to="/login" className="profile-menu-link">
                  <div className="profile-menu-item-icon">
                    <img src="../images/logout.svg" alt="Logout icon" />
                  </div>
                  <div className="profile-menu-item-info">
                    <div className="profile-menu-item-title">Log Out</div>
                  </div>
                </Link>
              </li>

            </ul>
          </li>
        </ul>
      </div>
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