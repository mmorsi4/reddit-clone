import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Post from "../components/post";
import ProfileSidebar from "../components/ProfileSidebar"; // Import the new component
import "../styles/ProfileSidebar.css"; // Import the CSS

function ViewProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState([]); 
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { username } = useParams(); // get username from url

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (res.status === 404) {
          setUser(null); // user not found
          return;
      }

      console.log(res)

      const data = await res.json();
      const userData = data;
      setUser(userData);
      
      // Check if this is the current user's own profile
      const currentUsername = localStorage.getItem('username');
      setIsOwnProfile(currentUsername === username);
    }

    fetchProfile();
  }, [username]);

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
        try {
            const res = await fetch("/api/communities/joined", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                const communities = await res.json();
                setJoinedCommunityIds(communities.map(c => c._id));
            } else {
                console.error("Error fetching joined communities:", await res.text());
            }
        } catch (error) {
            console.error("Error fetching joined communities:", error);
        }
    };
    
    fetchJoinedCommunities();
  }, []); 

  // Fetch user's comments when Comments tab is clicked
  const fetchUserComments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comments/my", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const comments = await res.json();
        setUserComments(comments);
      } else {
        const errorText = await res.text();
        console.error("Error fetching comments:", errorText);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's posts when Posts tab is clicked
  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/my/posts", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const posts = await res.json();
        setUserPosts(posts);
      } else {
        const errorText = await res.text();
        console.error("Error fetching posts:", errorText);
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
          {userPosts.map((post) => {
            const isUserJoined = joinedCommunityIds.includes(post.community?._id);

            return (
              <Post
                key={post._id}
                postId={post._id}
                username={post.author?.username || user.username}
                time={post.createdAt}
                title={post.title}
                preview={post.mediaUrl}
                textPreview={post.body}
                avatar={user.avatarUrl || "/images/avatar.png"}
                initialVotes={post.score || 0}
                initialVote={post.userVote || 0}
                initialComments={post.commentCount || 0}
                community={post.community?.name || "unknown"}
                isAllFeed={true}
                communityAvatarUrl={post.community?.avatar}
                isJoined={isUserJoined}
                onToggleJoin={null}
                viewType="normal"
                isCommunityPage={false}
              />
            );
          })}
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
          {hasPosts && userPosts.map((post) => {
            const isUserJoined = joinedCommunityIds.includes(post.community?._id);

            return (
              <Post
                key={`post-${post._id}`}
                postId={post._id}
                username={post.author?.username || user.username}
                time={post.createdAt}
                title={post.title}
                preview={post.mediaUrl}
                textPreview={post.body}
                avatar={user.avatarUrl || "/images/avatar.png"}
                initialVotes={post.score || 0}
                initialVote={post.userVote || 0}
                initialComments={post.commentCount || 0}
                community={post.community?.name || "unknown"}
                isAllFeed={true} 
                communityAvatarUrl={post.community?.avatar}
                isJoined={isUserJoined}
                onToggleJoin={null}
                viewType="normal"
                isCommunityPage={false}
              />
            );
          })}
          
          {/* Show comments as simple cards */}
          {hasComments && userComments.map((comment) => (
            <div key={`comment-${comment._id}`} className="profile-comment-card">
              <div className="profile-comment-header">
                <span className="profile-comment-meta">
                  Commented on "{comment.post?.title || "a post"}"
                </span>
                <span className="profile-comment-time">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span >
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
      <div className="profile-page-container">
        <div className="profile-page-content">
          {/* Main Content Column */}
          <div className="profile-main-column">
            <div className="profile-header-main">
              <div className="profile-header-avatar-info">
                <img
                  id="profile-avatar"
                  src={user.avatarUrl ? user.avatarUrl : "/images/avatar.png"}
                  alt="Avatar"
                  className="profile-avatar-main"
                />
                <div className="profile-info-main">
                  <h2 id="profile-name" className="profile-name-main">
                    {user.username}
                  </h2>
                  <p id="profile-username" className="profile-username-main">
                    u/{user.username}
                  </p>
                </div>
              </div>
              
              {isOwnProfile && (
                <Link to="/edit-avatar" className="profile-edit-btn">
                  Edit Profile
                </Link>
              )}
            </div>

            <div className="profile-tabs-main">
              <button 
                className={`profile-tab ${activeTab === "overview" ? "profile-tab-active" : ""}`}
                onClick={() => handleTabClick("overview")}
              >
                Overview
              </button>
              <button 
                className={`profile-tab ${activeTab === "posts" ? "profile-tab-active" : ""}`}
                onClick={() => handleTabClick("posts")}
              >
                Posts
              </button>
              <button 
                className={`profile-tab ${activeTab === "comments" ? "profile-tab-active" : ""}`}
                onClick={() => handleTabClick("comments")}
              >
                Comments
              </button>
              <button 
                className={`profile-tab ${activeTab === "hidden" ? "profile-tab-active" : ""}`}
                onClick={() => handleTabClick("hidden")}
              >
                Hidden
              </button>
              <button 
                className={`profile-tab ${activeTab === "upvoted" ? "profile-tab-active" : ""}`}
                onClick={() => handleTabClick("upvoted")}
              >
                Upvoted
              </button>
              <button 
                className={`profile-tab ${activeTab === "downvoted" ? "profile-tab-active" : ""}`}
                onClick={() => handleTabClick("downvoted")}
              >
                Downvoted
              </button>
            </div>

            <div className="profile-content-main">
              <div className="profile-content-header">
                <div className="showing-content-main">
                  <span>Showing {activeTab === "overview" ? "all" : activeTab} content</span>
                </div>

                {isOwnProfile && (
                  <div className="profile-create-post">
                    <Link to="/create_post">
                      <button className="profile-create-post-btn">+ Create Post</button>
                    </Link>
                    <select className="profile-sort-select">
                      <option>New</option>
                      <option>Top</option>
                      <option>Hot</option>
                    </select>
                  </div>
                )}
              </div>

              {renderTabContent()}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="profile-sidebar-column">
            <ProfileSidebar user={user} isOwnProfile={isOwnProfile} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewProfile;