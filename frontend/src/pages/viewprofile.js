import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function ViewProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { username } = useParams(); // get username from url

  useEffect(() => {
    // 🧠 Get current user data
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (res.status === 404) {
          setUser(null); // user not found
          return;
      }

      console.log(res)

      const data = await res.json();
      const userData = data;
      setUser(userData);
    }

    fetchProfile();
  }, [username]);

  // Fetch user's comments when Comments tab is clicked
  const fetchUserComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/comments/my", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const comments = await res.json();
        setUserComments(comments);
        console.log("User comments:", comments);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
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

    const messages = {
      overview: "hasn't posted yet",
      posts: "hasn't posted yet", 
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
    }
  };

  if (user === undefined) return <p></p>; // loading
  if (user === null) return <p>User not found</p>; // user not found


  return (
    <>
      <Header />
      <Sidebar/>
      <div className="main">
        <div className="profile-header">
          <img
            id="profile-avatar"
            src={user.avatarUrl ? user.avatarUrl : "../images/avatar.png"}
            alt="Avatar"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2 id="profile-name" className="profile-name">
              {user.username}
            </h2>
            <p id="profile-username" className="profile-username">
              u/{user.username}
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
            <Link to="/create_post">
              <button className="create-post-btn">+ Create Post</button>
            </Link>
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