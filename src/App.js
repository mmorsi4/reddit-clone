import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Community1 from "./pages/community1";
import Community2 from "./pages/community2";
import Community3 from "./pages/community3";
import Community4 from "./pages/community4";
import ManageCommunity from "./pages/manage_community";
import CreatePost from "./pages/create-post";
import ViewProfile from "./pages/viewprofile";
import Login from "./pages/Login";
import AvatarCustomizer from "./pages/edit-avatar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community1" element={<Community1 />} />
        <Route path="/community2" element={<Community2 />} />
        <Route path="/community3" element={<Community3 />} />
        <Route path="/community4" element={<Community4 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/manage_community" element={<ManageCommunity/>} />
        <Route path="/create_post"element={<CreatePost/>}/>
        <Route path="/viewprofile"element={<ViewProfile/>}/>
        <Route path="/edit-avatar"element={<AvatarCustomizer/>}/>
      </Routes>
    </Router>
  );
}

export default App;
