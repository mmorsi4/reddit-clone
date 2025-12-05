import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const HomeRightSidebar = () => {
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch(`/api/posts?limit=5&sort=new`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch recent posts");

        const data = await res.json();
        setRecentPosts(data);
      } catch (err) {
        console.error("Error loading recent posts:", err);
      }
    };

    fetchRecentPosts();
  }, []);

  return (
    <div className="right-sidebar-column" style={{ backgroundColor: "#f7f8f9" }}>
      <div className="right-sidebar-card">
        <h3 className="card-title">RECENT POSTS</h3>

        {recentPosts.length === 0 && (
          <p className="no-posts">No recent posts found.</p>
        )}

        {recentPosts.map((post) => (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            state={{ post }}
            className="right-sidebar-post-link"
          >
            <p className="sidebar-community">
              r/{post.community?.name}
            </p>

            <p className="sidebar-post-title">
              {post.title.length > 60
                ? post.title.slice(0, 60) + "..."
                : post.title}
            </p>

            <p className="sidebar-details">
              {post.score} upvotes · {post.commentCount || 0} comments
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeRightSidebar;