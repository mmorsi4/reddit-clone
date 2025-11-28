import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import CommentWithVotes from "../components/CommentWithVotes";

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

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/auth/me', {
          credentials: "include"
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
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
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      } else {
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
      }
    }, 0);
  };

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
        <div className="post-page">
          {/* Breadcrumb Navigation */}
          <div className="post-breadcrumb">
            <Link to="/home" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to={`/community/${post.community?.name}`} className="breadcrumb-link">
              r/{post.community?.name || "community"}
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Post</span>
          </div>

          {/* Main Post Content */}
          <div className="post-content-card">
            {/* Post Header */}
            <div className="post-header">
              <div className="post-meta">
                <span className="community-name">r/{post.community?.name}</span>
                <span className="meta-separator">•</span>
                <span className="post-author">Posted by u/{post.author?.username}</span>
                <span className="meta-separator">•</span>
                <span className="post-time">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Post Title */}
            <h1 className="post-title">{post.title}</h1>

            {/* Post Content */}
            <div className="post-content">
              {post.mediaUrl ? (
                <div className="post-media">
                  <img src={post.mediaUrl} alt="post content" className="post-image" />
                </div>
              ) : (
                <div className="post-text">
                  {post.body || "No content available."}
                </div>
              )}
            </div>

            {/* Post Actions & Voting */}
            <div className="post-actions">
              {/* Voting Section */}
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

              {/* Other Actions */}
              <button className="post-action-btn">
                <span className="action-icon">💬</span>
                <span>{post.commentCount || comments.length} Comments</span>
              </button>
              <button className="post-action-btn">
                <span className="action-icon">🔄</span>
                <span>Share</span>
              </button>
              <button className="post-action-btn">
                <span className="action-icon">📌</span>
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Comment Section */}
          <div className="comments-section">
            {/* Add Comment */}
            <div className="add-comment-card">
              <div className="comment-input-header">
                <span>Comment as <strong>{currentUser?.username || "You"}</strong></span>
              </div>
              
              {/* Formatting Toolbar */}
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
              <div className="comments-header">
                <div className="comments-header-left">
                  <h3>
                    {searchQuery ? 
                      `${filteredComments.length} of ${sortedComments.length} comments` : 
                      `${post.commentCount || comments.length} Comments`
                    }
                  </h3>
                  <div className="comments-controls">
                    <div className="sort-options">
                      <span className="sort-by-text">Sort by:</span>
                      <div className="sort-container">
                        <select 
                          className="sort-select" 
                          value={sortOption}
                          onChange={handleSortChange}
                        >
                          <option value="best">🏆 Best</option>
                          <option value="top">⬆️ Top</option>
                          <option value="new">🆕 New</option>
                          <option value="old">📜 Old</option>
                          <option value="controversial">🔥 Controversial</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="search-container">
                      <div className="search-input-wrapper">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                          <button 
                            className="clear-search-btn"
                            onClick={handleClearSearch}
                            title="Clear search"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {filteredComments.length === 0 ? (
                <div className="no-comments">
                  {searchQuery ? (
                    <p>No comments found for "{searchQuery}"</p>
                  ) : (
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>
              ) : (
                <div className="comments-container">
                  {filteredComments.map((comment, index) => (
                    <CommentWithVotes 
                      key={comment._id || index} 
                      comment={comment}
                      onReplyAdded={fetchPost}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostPage;