import { Link, useParams } from "react-router-dom";
import Post from "../components/post";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import CommunityHeader from "../components/communityHeader";
import React, { useState, useEffect } from "react";
import allCommunities from "../data/communitiesDB";
import postsDB from "../data/postsDB";
import MainSidebar from "../components/main-sidebar";
import Header from "../components/header"

function Community() {
  const { name } = useParams();
  const [posts, setPosts] = useState([]);
  const [community, setCommunity] = useState(null);
  const { name: communityName } = useParams();

  const communityPosts = postsDB.filter((p) => p.community === communityName);


  useEffect(() => {
    const builtIn = allCommunities;
    const custom = JSON.parse(localStorage.getItem("customCommunities")) || [];
    const all = [...builtIn, ...custom];
    const found = all.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    setCommunity(found);
  }, [name]);

  useEffect(() => {
    if (community) {
      const savedPosts =
        JSON.parse(localStorage.getItem(`posts_${name}`)) || [];
      setPosts(savedPosts);
    }
  }, [name, community]);

  if (!community) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Community not found</h2>;
  }

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <Header />
      {/* ---------- SIDEBAR & MAIN ---------- */}
      <Sidebar />

      <div className="main">
        <CommunityHeader
          banner={community.banner}
          avatar={community.avatar}
          name={community.name}
        />
        <div className="main-body">
          <div className="main-posts-container">
            <div className="main-posts">
              <div className="post-container">
                <div className="post">
                  {/* dynamic posts */}
                  {communityPosts.map((p, index) => (
                    <Post
                      key={index}
                      username={p.username}
                      time={p.time}
                      title={p.title}
                      textPreview={p.textPreview || ""}
                      preview={p.preview || ""}
                      avatar={p.avatar || "../images/avatar.png"}
                      initialVotes={p.initialVotes || 0}
                      initialComments={p.initialComments || []}
                      community={p.community}
                    />
                  ))}
                  {/*  example static posts */}
                  <Post
                    username="ExampleUser"
                    time="2 days ago"
                    title={`Welcome to ${community.name}!`}
                    textPreview="This is your first community post."
                    avatar="../images/avatar.png"
                    initialVotes={100}
                  />
                </div>
              </div>
            </div>
          </div>
          <MainSidebar community={community} />
        </div>
      </div>


    </>
  );
}

export default Community;