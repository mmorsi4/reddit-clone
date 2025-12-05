import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Post from "../components/post";
import "../styles/main.css";
import "../styles/home.css";
import "../styles/main-posts.css";
import HomeRightSidebar from "../components/HomeRightSidebar";

function Popular() {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [joinedCommunityNames, setJoinedCommunityNames] = useState(new Set());
  const [viewType, setViewType] = useState("card");

  const fetchPopularPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/posts/popular", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch popular posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchJoinedCommunities = useCallback(async () => {
    try {
      const res = await fetch("/api/memberships/joined", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const names = new Set(data.map(c => c.name));
        setJoinedCommunityNames(names);
      }
    } catch (err) {
      console.error("Error fetching joined communities:", err);
    }
  }, []);

  const handleToggleJoin = async (communityName, communityId, isCurrentlyJoined) => {
    const endpoint = isCurrentlyJoined ? `/api/memberships/unjoin` : `/api/memberships/join`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
        credentials: "include",
      });
      if (res.ok) {
        setJoinedCommunityNames(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyJoined) newSet.delete(communityName);
          else newSet.add(communityName);
          return newSet;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPopularPosts();
    fetchJoinedCommunities();
  }, [fetchJoinedCommunities]);

  return (
    <>
      <Header />
      <Sidebar />
      <div className="main">
        <div className="home-layout-wrapper">
          <div className="main-posts-column">
            <div className="posts-header">
              {/* View Toggle */}
              <div className="mini-view">
                <button
                  className="mini-view-btn"
                  onClick={() => setViewType(prev => (prev === "card" ? "compact" : "card"))}
                >
                  <img src={`../images/${viewType}-view.svg`} alt="view icon" />
                </button>
              </div>
            </div>

            <div className="post-list">
              {loadingPosts ? (
                <p style={{ textAlign: "center", marginTop: "20px" }}>Loading popular posts...</p>
              ) : posts.length === 0 ? (
                <p style={{ textAlign: "center", marginTop: "20px" }}>No popular posts yet.</p>
              ) : (
                posts.map(p => {
                  const communityName = p.community?.name || "[deleted]";
                  const isJoined = joinedCommunityNames.has(communityName);

                  return (
                    <Post
                    key={p._id}
                    postId={p._id}
                    username={p.author?.username || "Unknown"}
                    time={new Date(p.createdAt).toLocaleString()}
                    title={p.title}
                    textPreview={p.body || ""}
                    preview={p.mediaUrl || ""}
                    avatar={p.author?.avatarUrl || "../images/avatar.png"}
                    initialVotes={p.recentScore || 0}
                    initialVote={p.userVote}
                    initialComments={p.commentCount}
                    community={communityName}
                    communityAvatarUrl={p.community?.avatar || "../images/community-avatar-placeholder.png"}
                    isAllFeed={true}  // ✅ Pass true here
                    isJoined={isJoined}
                    onToggleJoin={(name) => handleToggleJoin(name, p.community?._id, isJoined)}
                    viewType={viewType}
                    />
                  );
                })
              )}
            </div>
          </div>
          <HomeRightSidebar />
        </div>
        
      </div>
    </>
  );
}

export default Popular;