import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import CommentWithVotes from "../components/CommentWithVotes";
import CommunitySidebar from "../components/CommunitySidebar";
import { formatDistanceToNow } from 'date-fns';

function PostPage() {
  const { postId } = useParams();
  const location = useLocation();
  
  const [post, setPost] = useState(location.state?.post || null);
  const [comments, setComments] = useState([]);
  const [sortedComments, setSortedComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(!location.state?.post);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortOption, setSortOption] = useState("best");
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [allCommunities, setAllCommunities] = useState([]);
  const [currentCommunity, setCurrentCommunity] = useState(null);

  // Fetch ALL communities like sidebar does
  useEffect(() => {
    const fetchAllCommunities = async () => {
      try {
        const res = await fetch("/api/communities/");
        if (!res.ok) throw new Error("Failed to fetch communities");
        const data = await res.json();
        setAllCommunities(data);
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };
    fetchAllCommunities();
  }, []);

  // Find the current community when post loads
  useEffect(() => {
    if (post?.community?.name && allCommunities.length > 0) {
      const foundCommunity = allCommunities.find(c => 
        c?.name?.toLowerCase() === post.community.name.toLowerCase()
      );
      setCurrentCommunity(foundCommunity);
    }
  }, [post?.community?.name, allCommunities]);

  // Debug community data
  useEffect(() => {
    if (post && post.community) {
      console.log("🔍 COMMUNITY DEBUG:", {
        communityName: post.community.name,
        avatarPath: post.community.avatar
      });
      
      const img = new Image();
      img.onload = () => console.log("✅ Image should work:", post.community.avatar);
      img.onerror = () => console.log("❌ Image won't load:", post.community.avatar);
      img.src = post.community.avatar;
    }
  }, [post]);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        } else {
          const savedUsername = localStorage.getItem("username") || "your_username";
          const savedAvatar = localStorage.getItem("userAvatar") || "../images/avatar.png";
          
          setCurrentUser({
            username: savedUsername,
            avatarUrl: savedAvatar
          });
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setCurrentUser({
          username: "your_username", 
          avatarUrl: "../images/avatar.png"
        });
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5001/api/posts/${postId}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Post not found");
      const data = await res.json();
      setPost(data.post);
      setComments(data.comments || []);
      setSortedComments(data.comments || []);
      setFilteredComments(data.comments || []);
    } catch (err) {
      console.error(err);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!location.state?.post) {
      fetchPost();
    }
  }, [fetchPost, location.state?.post]);

  // Sort comments when sortOption or comments change
  useEffect(() => {
    const sortComments = () => {
      let sorted = [...comments];
      
      switch (sortOption) {
        case "best":
          sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          break;
        case "top":
          sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          break;
        case "new":
          sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case "old":
          sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case "controversial":
          sorted.sort((a, b) => {
            const aScore = (a.upvotes || 0) - (a.downvotes || 0);
            const bScore = (b.upvotes || 0) - (b.downvotes || 0);
            return Math.abs(aScore) - Math.abs(bScore);
          }).reverse();
          break;
        default:
          sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      }
      
      setSortedComments(sorted);
    };
    
    sortComments();
  }, [comments, sortOption]);

  // Filter comments when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredComments(sortedComments);
    } else {
      const filtered = sortedComments.filter(comment => 
        comment.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredComments(filtered);
    }
  }, [searchQuery, sortedComments]);

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleVote = async (type) => {
    if (!post) return;
    try {
      let value;
      const currentVote = post.userVote;
      
      if (type === 'up') {
        value = currentVote === 1 ? 0 : 1;
      } else {
        value = currentVote === -1 ? 0 : -1;
      }
      
      const res = await fetch(`http://localhost:5001/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value })
      });

      if (res.ok) {
        const responseData = await res.json();
        setPost(prev => ({
          ...prev,
          score: responseData.score,
          userVote: value
        }));
      }
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch("http://localhost:5001/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          post: postId,
          body: newComment,
        }),
      });

      if (!res.ok) throw new Error("Failed to save comment");

      const savedComment = await res.json();
      
      const commentToAdd = {
        _id: savedComment._id || Date.now().toString(),
        body: newComment,
        author: {
          username: currentUser?.username || "You",
          avatar: currentUser?.avatar || "/default-avatar.png"
        },
        createdAt: new Date().toISOString(),
        upvotes: 0,
        userVote: null
      };
      
      setComments((prev) => [...prev, commentToAdd]);
      setNewComment("");
      setShowFormattingToolbar(false);
      await fetchPost();

    } catch (error) {
      console.error("Error saving comment:", error);
      alert("Failed to post comment");
    }
  };

  const handleCancelComment = () => {
    setNewComment("");
    setShowFormattingToolbar(false);
  };

  const handleFormatText = (format) => {
    const textarea = document.querySelector('.comment-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        cursorOffset = 2;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newText = newComment.substring(0, start) + formattedText + newComment.substring(end);
    setNewComment(newText);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      } else {
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
      }
    }, 0);
  };

  // Comments Header Component
  const CommentsHeader = () => (
    <div className="comments-header">
      <div className="comments-header-left">
        <h3>{filteredComments.length} Comments</h3>
        <div className="comments-controls">
          <div className="sort-options">
            <span className="sort-by-text">Sort by:</span>
            <div className="sort-container">
              <select 
                className="sort-select" 
                value={sortOption} 
                onChange={handleSortChange}
              >
                <option value="best">Best</option>
                <option value="top">Top</option>
                <option value="new">New</option>
                <option value="old">Old</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>
          </div>
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search comments..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={handleClearSearch}>
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <Sidebar />
        <div className="post-page-loading">
          <div className="loading-spinner"></div>
          <p>Loading post...</p>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <Sidebar />
        <div className="post-page-error">
          <h2>Post not found</h2>
          <Link to="/home" className="back-home-link">← Back to Home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar />
      <div className="post-page-container">
        <div className="post-page-content">
          {/* Main Content Column */}
          <div className="post-main-column">
            {/* Combined Back Button and Community Info */}
            <div className="post-header-navigation">
              <button className="back-button" onClick={() => window.history.back()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              
              {/* UPDATED: Using unique post-page class names */}
              <div className="post-page-community-info">
                <img 
                  src={currentCommunity?.avatar?.replace('/images/', '../images/')} 
                  alt="Community avatar" 
                  className="post-page-community-avatar"
                  onError={(e) => {
                    console.log("❌ Community avatar failed:", currentCommunity?.avatar);
                    e.target.src = "../images/default-community.png";
                  }}
                />
                <div className="post-page-community-meta">
                  <div className="post-page-community-line">
                    <span className="post-page-community-name">r/{post.community?.name}</span>
                    <span className="post-page-time-inline">
                      • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="post-page-username-below">
                    u/{post.author?.username}
                  </div>
                </div>
              </div>

              {/* Options Button with Dropdown */}
              <div className="post-options-container">
                <button 
                  className="post-options-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="post-options-dropdown">
                    <button className="dropdown-item">Save</button>
                    <button className="dropdown-item">Hide</button>
                    <button className="dropdown-item">Report</button>
                    <button className="dropdown-item">Crosspost</button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Post Content */}
            <div className="post-content-card">
              {/* Post Title */}
              <h1 className="post-title-large">{post.title}</h1>

              {/* Post Content */}
              <div className="post-content">
                {post.mediaUrl ? (
                  <div className="post-media">
                    <img 
                      src={post.mediaUrl} 
                      alt="post content" 
                      className="post-image"
                      onError={(e) => {
                        console.error("Failed to load image:", post.mediaUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="post-text">
                    {post.body || "No content available."}
                  </div>
                )}
              </div>

              {/* Post Actions & Voting */}
              <div className="post-actions">
                <div className="post-voting-horizontal">
                  <button 
                    className={`vote-btn upvote ${post.userVote === 1 ? 'active' : ''}`}
                    onClick={() => handleVote('up')}
                  >
                    <img 
                      src={post.userVote === 1 ? "../images/upvote-active.svg" : "../images/upvote.svg"} 
                      alt="upvote" 
                    />
                  </button>
                  <span className="vote-count">{post.score || 0}</span>
                  <button 
                    className={`vote-btn downvote ${post.userVote === -1 ? 'active' : ''}`}
                    onClick={() => handleVote('down')}
                  >
                    <img 
                      src={post.userVote === -1 ? "../images/downvote-active.svg" : "../images/downvote.svg"} 
                      alt="downvote" 
                    />
                  </button>
                </div>

                <button className="post-action-btn">
                  <span className="action-icon">💬</span>
                  <span>{post.commentCount || comments.length} Comments</span>
                </button>
                <button className="post-action-btn">
                  <span className="action-icon">🔄</span>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Comment Section */}
            <div className="comments-section">
              {/* Add Comment */}
              <div className="add-comment-card">
                <div className={`formatting-toolbar ${showFormattingToolbar ? 'visible' : ''}`}>
                  <button 
                    className="format-btn" 
                    onClick={() => handleFormatText('bold')}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button 
                    className="format-btn" 
                    onClick={() => handleFormatText('italic')}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button 
                    className="format-btn" 
                    onClick={() => handleFormatText('strikethrough')}
                    title="Strikethrough"
                  >
                    <s>S</s>
                  </button>
                  <button 
                    className="format-btn" 
                    onClick={() => handleFormatText('code')}
                    title="Code"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                    </svg>
                  </button>
                </div>
                
                <textarea
                  className="comment-textarea"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="4"
                  placeholder="What are your thoughts?"
                />
                
                <div className="comment-actions">
                  <div className="comment-actions-left">
                    <button 
                      className="format-toggle-btn"
                      onClick={() => setShowFormattingToolbar(!showFormattingToolbar)}
                      title="Formatting options"
                    >
                      Aa
                    </button>
                  </div>
                  <div className="comment-actions-right">
                    <button 
                      className="comment-cancel-btn"
                      onClick={handleCancelComment}
                    >
                      Cancel
                    </button>
                    <button 
                      className="comment-submit-btn"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="comments-list">
                <CommentsHeader />
                <div className="comments-container">
                  {filteredComments.length === 0 ? (
                    <div className="no-comments">
                      {searchQuery ? "No comments match your search." : "No comments yet."}
                    </div>
                  ) : (
                    filteredComments.map(comment => (
                      <CommentWithVotes
                        key={comment._id}
                        comment={comment}
                        currentUser={currentUser}
                        onCommentUpdate={fetchPost}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="post-sidebar-column">
            <div className="community-sidebar-container">
              <CommunitySidebar 
                communityId={post.community?._id} 
                post={post}
                currentUser={currentUser}
                isCommunityPage={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostPage;