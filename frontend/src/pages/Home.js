import "../styles/header.css";
import "../styles/search.css";
import "../styles/main.css";
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
import { Link } from "react-router-dom";
import Post from "../components/post";
import SearchBar from "../components/searchbar";
import Sidebar from "../components/sidebar";
import Header from "../components/header"


function Home() {

  return (
    <>
      <Header />
      <Sidebar />
      <div className="main">
        <div className="main-head">
          <div className="content-body">
            <div className="content-main">
              <div className="post-list">
                <Post
                  username="QuinnHannan1"
                  time="5 days ago"
                  title="I fired a great dev and wasted $50,000"
                  textPreview="I almost killed my startup before it even launched..."
                  avatar="../images/avatar.png"
                  initialVotes={443}
                  initialComments={[
                    { username: "techguru", text: "Oof, that sounds rough!" },
                    { username: "startuplife", text: "Been there. Lessons learned!" },]}
                />

                <Post
                  username="deathsowhat"
                  time="1 day ago"
                  title="I found the final boss guys"
                  preview="../images/preview-9.jpg"
                  avatar="../images/avatar-2.png"
                  initialVotes={43}
                  initialComments={[
                    { username: "gamerchick", text: "LOL that’s hilarious" },
                  ]}
                />


                <Post
                  username="_Maximum"
                  time="3 days ago"
                  title="Click to cancel, now with more gamification"
                  preview="../images/preview-3.gif"
                  avatar="../images/avatar-7.png"
                  initialVotes={563}
                  initialComments={[
                    { username: "uxfan", text: "That’s so true 😂" },
                    { username: "maximillion", text: "Great post!" },
                  ]}
                />



              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
