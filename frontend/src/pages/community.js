import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import MainSidebar from "../components/main-sidebar";
import Header from "../components/header";
import CommunityHeader from "../components/communityHeader";
import Post from "../components/post";

function Community() {
  const { name } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isMember, setIsMember] = useState(false);

  // Check if user is already a member
  useEffect(() => {
    const checkMembership = async () => {
      if (!community) return;
      try {
        const res = await fetch(`/api/memberships/check?communityId=${community._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setIsMember(data.isMember);
      } catch (err) {
        console.error(err);
      }
    };
    checkMembership();
  }, [community]);

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoadingCommunity(true);
      try {
        const res = await fetch(`/api/communities`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch communities");
        const data = await res.json();

        // find the community by name safely
        const found = data.find(c => c?.name?.toLowerCase() === name.toLowerCase());
        setCommunity(found || null);
      } catch (err) {
        console.error("Error fetching community:", err);
      } finally {
        setLoadingCommunity(false);
      }
    };

    fetchCommunity();
  }, [name]);

  // Fetch posts for this community from backend
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

  if (loadingCommunity) {
    // return <p>Loading community...</p>;
  }

  if (!community) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Community not found</h2>;
  }

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
                    preview={p.url || ""}
                    avatar={p.author?.avatarUrl || "../images/avatar.png"}
                    initialVotes={p.votes?.reduce((s, v) => s + v.value, 0) || 0}
                    initialComments={p.comments || []}
                    community={community.name}
                  />
                ))
              )}
            </div>
          </div>
          <MainSidebar community={community} />
        </div>
      </div>
    </>
  );
}

export default Community;