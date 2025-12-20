import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Post from "../components/post";
import ProfileComment from "../components/ProfileComment";
import ProfileSidebar from "../components/ProfileSidebar";
import "../styles/ProfileSidebar.css";

function ViewProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]); // NEW: Hidden posts state
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingHidden, setLoadingHidden] = useState(false); // NEW: Loading state for hidden posts
  const [joinedCommunityIds, setJoinedCommunityIds] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [allCommunities, setAllCommunities] = useState([]);
  const [upvotedPosts, setUpvotedPosts] = useState([]);
  const [downvotedPosts, setDownvotedPosts] = useState([]);
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [downvotedComments, setDownvotedComments] = useState([]);
  const { username } = useParams();


  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (res.status === 404) {
        setUser(null);
        return;
      }

      const data = await res.json();
      const userData = data;
      setUser(userData);

      const currentUsername = localStorage.getItem('username');
      setIsOwnProfile(currentUsername === username);
    }

    fetchProfile();
  }, [username]);

  // Fetch ALL communities
  useEffect(() => {
    const fetchAllCommunities = async () => {
      try {
        const res = await fetch("/api/communities/");
        if (!res.ok) throw new Error("Failed to fetch communities");
        const data = await res.json();
        setAllCommunities(data);
        console.log("All communities loaded:", data.length);
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };
    fetchAllCommunities();
  }, []);

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

  // Fetch user comments
  const fetchUserComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch("/api/comments/my", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const comments = await res.json();

        // Batch fetch all posts to get community data
        const postIds = comments
          .map(c => c.post?._id)
          .filter(id => id)
          .filter((value, index, self) => self.indexOf(value) === index);

        if (postIds.length > 0) {
          const postPromises = postIds.map(postId =>
            fetch(`/api/posts/${postId}`)
              .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch post ${postId}`);
                return res.json();
              })
              .then(data => ({
                postId,
                data: data.post || data
              }))
              .catch(err => {
                console.error(`Error fetching post ${postId}:`, err);
                return { postId, data: null };
              })
          );

          const postsData = await Promise.all(postPromises);

          const postMap = {};
          postsData.forEach(({ postId, data }) => {
            if (data) {
              postMap[postId] = data;
            }
          });

          const enrichedComments = comments.map(comment => {
            const postId = comment.post?._id;
            const fullPost = postMap[postId];

            if (fullPost) {
              return {
                ...comment,
                post: {
                  ...comment.post,
                  community: fullPost.community,
                  author: fullPost.author
                }
              };
            }

            return comment;
          });

          setUserComments(enrichedComments);
        } else {
          setUserComments(comments);
        }
      } else {
        const errorText = await res.text();
        console.error("Error fetching comments:", errorText);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
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
      setLoadingPosts(false);
    }
  };

  const fetchSavedPosts = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/posts/saved", {
        method: "GET",
        credentials: "include"
      });

      if (res.ok) {
        const posts = await res.json();
        setSavedPosts(posts);
      } else {
        console.error("Error fetching saved posts:", await res.text());
        setSavedPosts([]);
      }
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      setSavedPosts([]);
    } finally {
      setLoadingSaved(false);
    }
  };
  const fetchHiddenPosts = async () => {
    setLoadingHidden(true);
    try {
      const res = await fetch("/api/posts/hidden", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache" // ensures fresh data
        },
        credentials: "include" // send cookies automatically
      });

      if (res.status === 200) {
        const posts = await res.json();
        console.log("Hidden posts fetched:", posts.length);
        setHiddenPosts(posts);
      } else if (res.status === 304) {
        console.log("Hidden posts not modified, using cached data");
        // optionally keep previous state
      } else {
        const errorText = await res.text();
        console.error("Error fetching hidden posts:", errorText);
        setHiddenPosts([]);
      }
    } catch (error) {
      console.error("Error fetching hidden posts:", error);
      setHiddenPosts([]);
    } finally {
      setLoadingHidden(false);
    }
  };

  // Handle unsave from profile
  const handleUnsavePost = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/unsave`, {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        setSavedPosts(prev => prev.filter(post => post._id !== postId));
        setUserPosts(prev =>
          prev.map(post =>
            post._id === postId ? { ...post, isSaved: false } : post
          )
        );
      } else {
        console.error("Unsave failed:", await res.text());
        alert("Failed to unsave post.");
      }
    } catch (error) {
      console.error("Unsave error:", error);
      alert("An error occurred.");
    }
  };
  // NEW: Handle unhide from profile
  const handleUnhidePost = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/unhide`, {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        setHiddenPosts(prev => prev.filter(post => post._id !== postId));
      } else {
        console.error("Unhide failed:", await res.text());
        alert("Failed to unhide post.");
      }
    } catch (error) {
      console.error("Unhide error:", error);
      alert("An error occurred.");
    }
  };

  const renderTabContent = () => {

    if (activeTab === "upvoted") {
      return (
        <div>
          <h3>Upvoted Posts</h3>
          {upvotedPosts.length
            ? upvotedPosts.map(post => <Post key={post._id} {...post} />)
            : <p>No upvoted posts</p>
          }          <h3>Upvoted Comments</h3>
          {upvotedComments.length ? upvotedComments.map(comment => <ProfileComment key={comment._id} comment={comment} user={user} allCommunities={allCommunities} />) : <p>No upvoted comments</p>}
        </div>
      );
    }

    if (activeTab === "downvoted") {
      return (
        <div>
          <h3>Downvoted Posts</h3>
          {downvotedPosts.length
            ? downvotedPosts.map(post => <Post key={post._id} {...post} />)
            : <p>No downvoted posts</p>
          }
          <h3>Downvoted Comments</h3>
          {downvotedComments.length ? downvotedComments.map(comment => <ProfileComment key={comment._id} comment={comment} user={user} allCommunities={allCommunities} />) : <p>No downvoted comments</p>}
        </div>
      );
    };

    if (activeTab === "comments") {
      if (loadingComments) {
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
        <div className="profile-comments-container">
          {userComments.map(comment => (
            <ProfileComment
              key={comment._id}
              comment={comment}
              user={user}
              allCommunities={allCommunities}
            />
          ))}
        </div>
      );
    }

    if (activeTab === "posts") {
      if (loadingPosts) {
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
                isSaved={post.isSaved || false}
                onUnsave={handleUnsavePost}
              />
            );
          })}
        </div>
      );
    }

    // Saved tab content
    if (activeTab === "saved") {
      if (loadingSaved) {
        return (
          <div className="empty-state">
            <p className="empty-text">Loading saved posts...</p>
          </div>
        );
      }

      if (savedPosts.length === 0) {
        return (
          <div className="empty-state">
            <p className="empty-text">
              {user ? `u/${user.username} hasn't saved any posts yet` : "No saved posts"}
            </p>
          </div>
        );
      }

      return (
        <div>
          {savedPosts.map((post) => {
            const isUserJoined = joinedCommunityIds.includes(post.community?._id);

            return (
              <Post
                key={post._id}
                postId={post._id}
                username={post.author?.username || user?.username}
                time={post.createdAt}
                title={post.title}
                preview={post.mediaUrl}
                textPreview={post.body}
                avatar={post.author?.avatarUrl || user?.avatarUrl || "/images/avatar.png"}
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
                isSaved={true}
                onUnsave={handleUnsavePost}
              />
            );
          })}
        </div>
      );
    }

    // NEW: Hidden tab content
    if (activeTab === "hidden") {
      if (loadingHidden) {
        return (
          <div className="empty-state">
            <p className="empty-text">Loading hidden posts...</p>
          </div>
        );
      }

      if (hiddenPosts.length === 0) {
        return (
          <div className="empty-state">
            <p className="empty-text">
              {user ? `u/${user.username} hasn't hidden any posts yet` : "No hidden posts"}
            </p>
          </div>
        );
      }

      return (
        <div>
          {hiddenPosts.map((post) => {
            const isUserJoined = joinedCommunityIds.includes(post.community?._id);

            return (
              <Post
                key={post._id}
                postId={post._id}
                username={post.author?.username || user?.username}
                time={post.createdAt}
                title={post.title}
                preview={post.mediaUrl}
                textPreview={post.body}
                avatar={post.author?.avatarUrl || user?.avatarUrl || "/images/avatar.png"}
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
                isHidden={true}
                onUnhide={handleUnhidePost} // Pass the unhide handler
              />
            );
          })}
        </div>
      );
    }

    if (activeTab === "overview") {
      const hasPosts = userPosts.length > 0;
      const hasComments = userComments.length > 0;
      const hasSaved = savedPosts.length > 0;
      const hasHidden = hiddenPosts.length > 0 && isOwnProfile; // Only show hidden in overview if it's own profile

      if (!hasPosts && !hasComments && !hasSaved && !hasHidden) {
        return (
          <div className="empty-state">
            <p className="empty-text">
              {user ? `u/${user.username} hasn't posted, commented, or saved anything yet` : "User has no content"}
            </p>
          </div>
        );
      }

      return (
        <div className="profile-overview-content">
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
                isSaved={post.isSaved || false}
                onUnsave={handleUnsavePost}
              />
            );
          })}

          {hasSaved && (
            <div className="profile-overview-saved-section">
              <h3 className="profile-overview-section-title">
                Saved Posts {savedPosts.length > 3 && `(${savedPosts.length})`}
              </h3>
              {savedPosts.slice(0, 3).map((post) => {
                const isUserJoined = joinedCommunityIds.includes(post.community?._id);
                return (
                  <Post
                    key={`saved-${post._id}`}
                    postId={post._id}
                    username={post.author?.username || user?.username}
                    time={post.createdAt}
                    title={post.title}
                    preview={post.mediaUrl}
                    textPreview={post.body}
                    avatar={post.author?.avatarUrl || user?.avatarUrl || "/images/avatar.png"}
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
                    isSaved={true}
                    onUnsave={handleUnsavePost}
                  />
                );
              })}

              {savedPosts.length > 3 && (
                <button
                  className="profile-view-all-btn"
                  onClick={() => {
                    setActiveTab("saved");
                    fetchSavedPosts();
                  }}
                >
                  View all {savedPosts.length} saved posts
                </button>
              )}
            </div>
          )}

          {/* NEW: Hidden posts section in overview (only for own profile) */}
          {hasHidden && isOwnProfile && (
            <div className="profile-overview-hidden-section">
              <h3 className="profile-overview-section-title">
                Hidden Posts {hiddenPosts.length > 3 && `(${hiddenPosts.length})`}
              </h3>
              {hiddenPosts.slice(0, 3).map((post) => {
                const isUserJoined = joinedCommunityIds.includes(post.community?._id);
                return (
                  <Post
                    key={`hidden-${post._id}`}
                    postId={post._id}
                    username={post.author?.username || user?.username}
                    time={post.createdAt}
                    title={post.title}
                    preview={post.mediaUrl}
                    textPreview={post.body}
                    avatar={post.author?.avatarUrl || user?.avatarUrl || "/images/avatar.png"}
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
                    isHidden={true}
                    onUnhide={handleUnhidePost}
                  />
                );
              })}

              {hiddenPosts.length > 3 && (
                <button
                  className="profile-view-all-btn"
                  onClick={() => {
                    setActiveTab("hidden");
                    fetchHiddenPosts();
                  }}
                >
                  View all {hiddenPosts.length} hidden posts
                </button>
              )}
            </div>
          )}

          {hasComments && (
            <div className="profile-overview-comments-section">
              <h3 className="profile-overview-section-title">
                Recent Comments {userComments.length > 3 && `(${userComments.length})`}
              </h3>
              {userComments.slice(0, 3).map(comment => (
                <ProfileComment
                  key={comment._id}
                  comment={comment}
                  user={user}
                  allCommunities={allCommunities}
                />
              ))}

              {userComments.length > 3 && (
                <button
                  className="profile-view-all-btn"
                  onClick={() => {
                    setActiveTab("comments");
                    fetchUserComments();
                  }}
                >
                  View all {userComments.length} comments
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    const messages = {
      hidden: "has no hidden content",
      upvoted: "hasn't upvoted anything yet",
      downvoted: "hasn't downvoted anything yet",
      saved: "hasn't saved anything yet"
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
    if (tabName === "comments") fetchUserComments();
    else if (tabName === "posts") fetchUserPosts();
    else if (tabName === "saved") fetchSavedPosts();
    else if (tabName === "hidden") fetchHiddenPosts();
    else if (tabName === "upvoted") {
      fetchUpvotedPosts();
      fetchUpvotedComments();
    } else if (tabName === "downvoted") {
      fetchDownvotedPosts();
      fetchDownvotedComments();
    }
  };

  const fetchUpvotedPosts = async () => {
    try {
      const res = await fetch("/api/posts/upvoted", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUpvotedPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDownvotedPosts = async () => {
    try {
      const res = await fetch("/api/posts/downvoted", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDownvotedPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUpvotedComments = async () => {
    try {
      const res = await fetch("/api/comments/upvoted", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUpvotedComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDownvotedComments = async () => {
    try {
      const res = await fetch("/api/comments/downvoted", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDownvotedComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load initial data for overview when profile loads and it's own profile
  useEffect(() => {
    if (user && isOwnProfile) {
      fetchUserPosts();
      fetchUserComments();
      fetchSavedPosts();
      fetchHiddenPosts(); // NEW: Also fetch hidden posts for own profile
    }
  }, [user, isOwnProfile]);

  if (user === undefined) return <p>Loading...</p>;
  if (user === null) return <p>User not found</p>;

  return (
    <>
      <Header />
      <Sidebar />
      <div className="profile-page-container">
        <div className="profile-page-content">
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
                className={`profile-tab ${activeTab === "saved" ? "profile-tab-active" : ""}`}
                onClick={() => handleTabClick("saved")}
              >
                Saved
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

          <div className="profile-sidebar-column">
            <ProfileSidebar user={user} isOwnProfile={isOwnProfile} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewProfile;