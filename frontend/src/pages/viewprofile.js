import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import Header from "../components/header";

function ViewProfile() {
  useEffect(() => {
    // 🧠 Get current user data
    const fetchProfile = async () => {
      const res = await fetch("/api/view_profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      console.log(res)

      // const user = JSON.parse(localStorage.getItem("currentUser"));
      const data = await res.json();
      const user = data.user;

      console.log(user);

      // const savedAvatar = localStorage.getItem("userAvatar");
      const savedAvatar = user.avatarUrl || NaN;

      const avatarEl = document.getElementById("profile-avatar");
      const nameEl = document.getElementById("profile-name");
      const usernameEl = document.getElementById("profile-username");
      const emptyTextEl = document.getElementById("empty-text");


      if (user) {
        nameEl.textContent = user.username;
        usernameEl.textContent = `u/${user.username}`;
        emptyTextEl.textContent = `u/${user.username} hasn't posted yet`;
      }

      // 🧩 If saved avatar exists, load it
      if (savedAvatar) {
        avatarEl.src = savedAvatar;
      }
    }

    fetchProfile();
  }, []);
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
          <button className="tab active">Overview</button>
          <button className="tab">Posts</button>
          <button className="tab">Comments</button>
          <button className="tab">Saved</button>
          <button className="tab">History</button>
          <button className="tab">Hidden</button>
          <button className="tab">Upvoted</button>
          <button className="tab">Downvoted</button>
        </div>

        <div className="profile-content">
          <div className="showing-content">
            <span>Showing all content</span>
          </div>

          <div className="create-post">
            <button className="create-post-btn">+ Create Post</button>
            <select className="sort-select">
              <option>New</option>
              <option>Top</option>
              <option>Hot</option>
            </select>
          </div>

          <div className="empty-state">
            <p className="empty-text" id="empty-text">
              User hasn’t posted yet
            </p>
          </div>
        </div>
      </div>

    </>
  );
}
export default ViewProfile;