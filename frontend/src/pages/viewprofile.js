import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Post from "../components/post"

function ViewProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { username } = useParams(); // get username from url

  useEffect(() => {
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
     
      const res = await fetch("http://localhost:5001/api/comments/my", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });


      if (res.ok) {
        const comments = await res.json();
        setUserComments(comments);
        
      } else {
        const errorText = await res.text();
        
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's posts when Posts tab is clicked
  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/posts/my/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if (res.ok) {
        const posts = await res.json();
        setUserPosts(posts);
      } else {
        const errorText = await res.text();
      }
    } catch (error) {
      console.error("Error details:", error.message);
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
        <div>
          {userPosts.map((post) => (
            <Post
              key={post._id}
              postId={post._id}
              username={post.author?.username || user.username}
              time={post.createdAt}
              title={post.title}
              preview={post.mediaUrl}
              textPreview={post.body}
              avatar={user.avatarUrl || "../images/avatar.png"}
              initialVotes={post.score || 0}
              initialVote={post.userVote || 0}
              initialComments={post.commentCount || 0}
              community={post.community?.name || "unknown"}
              isAllFeed={true}
              communityAvatarUrl={
                post.community?.avatar 
                  ? post.community.avatar.startsWith('/') 
                    ? `..${post.community.avatar}` // Add .. if it starts with /
                    : post.community.avatar
                  : "../images/default-community.svg"
              }
              isJoined={false}
              onToggleJoin={null}
              viewType="normal"
              isCommunityPage={false}
            />
          ))}
        </div>
      );
    }

    // For "overview" tab - show both posts and comments
    if (activeTab === "overview") {
      if (loading) {
        return (
          <div className="empty-state">
            <p className="empty-text">Loading...</p>
          </div>
        );
      }

      const hasPosts = userPosts.length > 0;
      const hasComments = userComments.length > 0;

      if (!hasPosts && !hasComments) {
        return (
          <div className="empty-state">
            <p className="empty-text">
              {user ? `u/${user.username} hasn't posted or commented yet` : "User hasn't posted or commented yet"}
            </p>
          </div>
        );
      }

      return (
        <div className="profile-overview-content">
          {/* Show posts */}
          {hasPosts && userPosts.map((post) => (
            <Post
              key={`post-${post._id}`}
              postId={post._id}
              username={post.author?.username || user.username}
              time={post.createdAt}
              title={post.title}
              preview={post.mediaUrl}
              textPreview={post.body}
              avatar={user.avatarUrl || "../images/avatar.png"}
              initialVotes={post.score || 0}
              initialVote={post.userVote || 0}
              initialComments={post.commentCount || 0}
              community={post.community?.name || "unknown"}
              isAllFeed={false}
              communityAvatarUrl={post.community?.avatar || "../images/default-community.svg"}
              isJoined={false}
              onToggleJoin={null}
              viewType="normal"
              isCommunityPage={false}
            />
          ))}
          
          {/* Show comments as simple cards */}
          {hasComments && userComments.map((comment) => (
            <div key={`comment-${comment._id}`} className="profile-comment-card">
              <div className="profile-comment-header">
                <span className="profile-comment-meta">
                  Commented on "{comment.post?.title || "a post"}"
                </span>
                <span className="profile-comment-time">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="profile-comment-body">{comment.body || comment.text}</p>
            </div>
          ))}
        </div>
      );
    }

    // For other tabs (hidden, upvoted, downvoted)
    const messages = {
      hidden: "has no hidden content",
      upvoted: "hasn't upvoted anything yet",
      downvoted: "hasn't downvoted anything yet"
    };

    return (
      <div className="empty-state">
        <p className="empty-text" id="empty-text">
          {user ? `u/${user.username} ${messages[activeTab] || "has no content"}` : "User has no content"}
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