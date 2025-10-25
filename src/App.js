import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Community from "./pages/community";
import ManageCommunity from "./pages/manage_community";
import CreatePost from "./pages/create-post";
import ViewProfile from "./pages/viewprofile";
import Login from "./pages/Login";
import AvatarCustomizer from "./pages/edit-avatar";
import CreateCommunityPopup from "./components/create-community";
import PostPage from "./pages/PostPage";
import CustomFeedPopup from "./pages/CustomFeedPopup";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community/:name" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/manage_community" element={<ManageCommunity/>} />
        <Route path="/create_post"element={<CreatePost/>}/>
        <Route path="/viewprofile"element={<ViewProfile/>}/>
        <Route path="/edit-avatar"element={<AvatarCustomizer/>}/>
        <Route path="/create-community"element={<CreateCommunityPopup/>}/>
        <Route path="/CustomFeedPopup"element={<CustomFeedPopup/>}/>
        <Route path="/community/:communityName/:postTitle" element={<PostPage />} />
      </Routes>
    </Router>
  );
}



export default App;
