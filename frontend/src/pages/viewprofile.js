import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import Header from "../components/header";

function ViewProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🧠 Get current user data
    const fetchProfile = async () => {
      const res = await fetch("/api/view_profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      console.log(res)

      const data = await res.json();
      const userData = data.user;
      setUser(userData);

      console.log(userData);

      const savedAvatar = userData.avatarUrl || NaN;

      const avatarEl = document.getElementById("profile-avatar");
      const nameEl = document.getElementById("profile-name");
      const usernameEl = document.getElementById("profile-username");
      const emptyTextEl = document.getElementById("empty-text");

      if (userData) {
        nameEl.textContent = userData.username;
        usernameEl.textContent = `u/${userData.username}`;
        emptyTextEl.textContent = `u/${userData.username} hasn't posted yet`;
      }

      // 🧩 If saved avatar exists, load it
      if (savedAvatar) {
        avatarEl.src = savedAvatar;
      }
    }

    fetchProfile();
  }, []);

  // Fetch user's comments when Comments tab is clicked
  const fetchUserComments = async () => {
    setLoading(true);
    try {
      console.log("🔍 Starting to fetch user comments...");
      
      const res = await fetch("http://localhost:5001/api/comments/my", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      console.log("📥 Comments response status:", res.status);
      console.log("📥 Comments response ok:", res.ok);

      if (res.ok) {
        const comments = await res.json();
        setUserComments(comments);
        console.log("✅ User comments fetched:", comments);
      } else {
        const errorText = await res.text();
        console.error("❌ Failed to fetch comments. Status:", res.status, "Error:", errorText);
      }
    } catch (error) {
      console.error("💥 Error fetching comments:", error);
      console.error("💥 Error details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's posts when Posts tab is clicked
  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      console.log("🔍 Starting to fetch user posts...");
      
      const res = await fetch("http://localhost:5001/api/posts/my/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      console.log("📥 Posts response status:", res.status);
      console.log("📥 Posts response ok:", res.ok);

      if (res.ok) {
        const posts = await res.json();
        setUserPosts(posts);
        console.log("✅ User posts fetched:", posts);
      } else {
        const errorText = await res.text();
        console.error("❌ Failed to fetch posts. Status:", res.status, "Error:", errorText);
      }
    } catch (error) {
      console.error("💥 Error fetching posts:", error);
      console.error("💥 Error details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to render content based on active tab
  const renderTabContent = () => {
    if (activeTab === "comments") {
      if (loading) {
        return (
          <div className="empty-state">
            <p className="empty-text">Loading comments...</p>
          </div>
        );
      }

      if (userComments.length === 0) {
        return (
          <div className="empty-state">
            <p className="empty-text">
              {user ? `u/${user.username} hasn't commented yet` : "User hasn't commented yet"}
            </p>
          </div>
        );
      }

      return (
        <div className="comments-list">
          {userComments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <p className="comment-text">{comment.body || comment.text}</p>
              <p className="comment-meta">
                On post: {comment.post?.title || "Unknown post"} • 
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "posts") {
      if (loading) {
        return (
          <div className="empty-state">
            <p className="empty-text">Loading posts...</p>
          </div>
        );
      }

      if (userPosts.length === 0) {
        return (
          <div className="empty-state">
            <p className="empty-text">
              {user ? `u/${user.username} hasn't posted yet` : "User hasn't posted yet"}
            </p>
          </div>
        );
      }

      return (
        <div className="posts-list">
          {userPosts.map((post) => (
            <div key={post._id} className="post-item">
              <Link to={`/post/${post._id}`} className="post-link">
                <h4 className="post-title">{post.title}</h4>
              </Link>
              <p className="post-body">{post.body || "No content"}</p>
              <p className="post-meta">
                In r/{post.community?.name || "unknown"} • 
                {new Date(post.createdAt).toLocaleDateString()} • 
                {post.commentCount || 0} comments
              </p>
            </div>
          ))}
        </div>
      );
    }

    const messages = {
      overview: "hasn't posted yet",
      hidden: "has no hidden content",
      upvoted: "hasn't upvoted anything yet",
      downvoted: "hasn't downvoted anything yet"
    };

    return (
      <div className="empty-state">
        <p className="empty-text" id="empty-text">
          {user ? `u/${user.username} ${messages[activeTab]}` : "User hasn't posted yet"}
        </p>
      </div>
    );
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "comments") {
      fetchUserComments();
    } else if (tabName === "posts") {
      fetchUserPosts();
    }
  };

  return (
    <>
      <Header />
      <Sidebar/>
      <div className="main">
        <div className="profile-header">
          <img
            id="profile-avatar"
            src="../images/default-avatar.png"
            alt="Avatar"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2 id="profile-name" className="profile-name">
              Username
            </h2>
            <p id="profile-username" className="profile-username">
              u/username
            </p>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleTabClick("overview")}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => handleTabClick("posts")}
          >
            Posts
          </button>
          <button 
            className={`tab ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => handleTabClick("comments")}
          >
            Comments
          </button>
          <button 
            className={`tab ${activeTab === "hidden" ? "active" : ""}`}
            onClick={() => handleTabClick("hidden")}
          >
            Hidden
          </button>
          <button 
            className={`tab ${activeTab === "upvoted" ? "active" : ""}`}
            onClick={() => handleTabClick("upvoted")}
          >
            Upvoted
          </button>
          <button 
            className={`tab ${activeTab === "downvoted" ? "active" : ""}`}
            onClick={() => handleTabClick("downvoted")}
          >
            Downvoted
          </button>
        </div>

        <div className="profile-content">
          <div className="showing-content">
            <span>Showing {activeTab === "overview" ? "all" : activeTab} content</span>
          </div>

          <div className="create-post">
            <button className="create-post-btn">+ Create Post</button>
            <select className="sort-select">
              <option>New</option>
              <option>Top</option>
              <option>Hot</option>
            </select>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </>
  );
}

export default ViewProfile;