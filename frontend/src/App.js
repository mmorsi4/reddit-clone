import React, { useState } from "react";
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

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message, duration = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/community/:name" element={<Community />} />
        <Route path="/home" element={<Home />} />
        <Route path="/manage_community" element={<ManageCommunity/>} />
        <Route path="/create_post"element={<CreatePost showToast={showToastMessage} />}/>
        <Route path="/viewprofile"element={<ViewProfile/>}/>
        <Route path="/edit-avatar"element={<AvatarCustomizer/>}/>
        <Route path="/create-community"element={<CreateCommunityPopup/>}/>
        <Route path="/CustomFeedPopup"element={<CustomFeedPopup/>}/>
        <Route path="/community/:communityName/:postTitle" element={<PostPage />} />
      </Routes>
    </Router>

    {showToast && (
        <div className="toast">{toastMessage}</div>
      )}
    </>
  );
}



export default App;
