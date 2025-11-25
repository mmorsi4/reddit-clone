import "../styles/header.css";
import "../styles/search.css";
import "../styles/main.css";
import "../styles/home.css";
import "../styles/sidebar.css";
import "../styles/main-sidebar.css";
import "../styles/community.css";
import "../styles/main-posts.css";
import "../styles/viewprofile.css";
import "../styles/manage.css";
import "../styles/create_post.css";
import "../styles/edit_avatar.css";
import "../styles/postpage.css";
import "../styles/create_community.css";
import { Link, useLocation } from "react-router-dom";
import Post from "../components/post";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import React, { useState, useEffect } from "react"; 


const HomeRightSidebar = () => {
    return (
        // Added style to the inline div for the new background color
        <div className="right-sidebar-column" style={{ backgroundColor: '#f7f8f9' }}> 
            <div className="right-sidebar-card">
                <h3 className="card-title">RECENT POSTS</h3>
                <Link to="/r/community1/post/abc" className="right-sidebar-post-link"> 
                    <p className="sidebar-community">r/CommunityName1</p>
                    <p className="sidebar-post-title">This is a recent post title...</p>
                    <p className="sidebar-details">45 upvotes · 3 comments</p>
                </Link>
                <Link to="/r/community2/post/xyz" className="right-sidebar-post-link">
                    <p className="sidebar-community">r/CommunityName2</p>
                    <p className="sidebar-post-title">Another interesting discussion thread.</p>
                    <p className="sidebar-details">120 upvotes · 15 comments</p>
                </Link>
                <Link to="/r/community3/post/lmn" className="right-sidebar-post-link">
                    <p className="sidebar-community">r/CommunityName3</p>
                    <p className="sidebar-post-title">Help needed with MERN stack layout!</p>
                    <p className="sidebar-details">12 upvotes · 5 comments</p>
                </Link>
                {/* You can add more cards here for "Trending" or "About Reddit" */}
            </div>
        </div>
    );
};


function Home() {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // 1. Get the current location object, which contains the query string
  const location = useLocation();

  useEffect(() => {
    const fetchHomeFeed = async () => {
      setLoadingPosts(true);
      
      // 2. Check the current query string to determine the API endpoint
      const isAllFeed = location.search === "?feed=all";
      
      // Determine the API endpoint based on the query parameter
      // - If ?feed=all is present, use the global feed (all-feed route).
      // - Otherwise, use the personalized feed (feed route).
      const apiEndpoint = isAllFeed ? `/api/posts/all-feed` : `/api/posts/feed`;
      
      try {
        const res = await fetch(apiEndpoint, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch posts from " + apiEndpoint);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchHomeFeed();
    // 3. Dependency array: Re-run effect whenever the URL query string changes
  }, [location.search]); 

  // Determine the correct message based on the current feed
  const emptyFeedMessage = location.search === "?feed=all"
    ? "No posts found in the 'All' feed."
    : "No posts available yet. Be the first to post!";

  return (
    <>
      <Header />
      <Sidebar />
      <div className="main">
        {/* NEW Wrapper for Centering and Two-Column Layout */}
        <div className="home-layout-wrapper">
          
          {/* Main Posts Column */}
          <div className="main-posts-column">
            <div className="post-list">
              {loadingPosts ? (
                <p style={{ textAlign: "center", marginTop: "20px" }}>Loading posts...</p>
              ) : posts.length === 0 ? (
                <p style={{ textAlign: "center", marginTop: "20px" }}>{emptyFeedMessage}</p>
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
                    initialVotes={p.votes?.reduce((s, v) => s + v.value, 0) || 0}
                    initialComments={p.comments || []}
                    community={p.community?.name || "[deleted]"}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Right Sidebar Column */}
          <HomeRightSidebar />

        </div>
        {/* END NEW Wrapper */}
      </div>
    </>
  );
}

export default Home;