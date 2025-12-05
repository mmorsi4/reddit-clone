import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import MainSidebar from "../components/main-sidebar";
import Header from "../components/header";
import CommunityHeader from "../components/communityHeader";
import Post from "../components/post";
import CommunitySidebar from "../components/CommunitySidebar";

function Community() {
  const { name } = useParams();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔹 Caching
  const [communitiesCache, setCommunitiesCache] = useState({});
  const [userCache, setUserCache] = useState(null);

  // Fetch current user with caching
  useEffect(() => {
    if (userCache) {
      setCurrentUser(userCache); // use cached user
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
          setUserCache(userData); // cache it
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchCurrentUser();
  }, [userCache]);

  // Fetch community with caching
  useEffect(() => {
    const fetchCommunity = async () => {
      setLoadingCommunity(true);

      // Check cache first
      if (communitiesCache[name]) {
        setCommunity(communitiesCache[name]);
        setLoadingCommunity(false);
        return;
      }

      try {
        const res = await fetch(`/api/communities`, { method: "GET", credentials: "include" });
        if (res.status === 429) {
          console.warn("Too many requests, try again later.");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch communities");

        const data = await res.json();
        const found = data.find(c => c?.name?.toLowerCase() === name.toLowerCase());

        setCommunity(found || null);

        // Save to cache
        setCommunitiesCache(prev => ({ ...prev, [name]: found || null }));
      } catch (err) {
        console.error("Error fetching community:", err);
      } finally {
        setLoadingCommunity(false);
      }
    };

    fetchCommunity();
  }, [name, communitiesCache]);

  // Fetch posts for this community
  useEffect(() => {
    if (!community) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`/api/posts?community=${community.name}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [community]);

  if (loadingCommunity) return <p>Loading community...</p>;
  if (!community) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Community not found</h2>;

  return (
    <>
      <Header />
      <Sidebar />

      <div className="main">
        <CommunityHeader
          banner={community.banner}
          avatar={community.avatar}
          name={community.name}
          communityId={community._id}
        />

        <div className="main-body">
          <div className="main-posts-container">
            <div className="main-posts">
              {loadingPosts ? (
                <p>Loading posts...</p>
              ) : posts.length === 0 ? (
                <p style={{ textAlign: "center", marginTop: "20px" }}>No posts yet in this community.</p>
              ) : (
                posts.map((p) => (
                  <Post
                    key={p._id}
                    postId={p._id}
                    username={p.author?.username || "Unknown"}
                    time={new Date(p.createdAt).toLocaleString()}
                    title={p.title}
                    textPreview={p.body || ""}
                    preview={p.mediaUrl || ""}
                    avatar={p.author?.avatarUrl || "../images/avatar.png"}
                    initialVotes={p.score}
                    initialVote={p.userVote}
                    initialComments={p.commentCount}
                    community={community.name}
                    isAllFeed={false}
                    isCommunityPage={true}
                    communityAvatarUrl={null}
                    viewType={"card"}
                  />
                ))
              )}
            </div>
          </div>

          {/* REPLACE MainSidebar with CommunitySidebar */}
          <div className="community-sidebar-column">
            <div className="community-sidebar-container">
              <CommunitySidebar
                communityId={community._id}
                post={null} // No specific post on community page
                currentUser={currentUser}
                showJoinButton={false}
                isCommunityPage={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Community;