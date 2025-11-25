import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import AddCommunitiesModal from '../pages/addcommunitiesPopup';
import CustomFeedPopup from './CustomFeedPopup';
import Post from '../components/post';

function CustomFeedPage() {
  const { feedName } = useParams();
  const [feed, setFeed] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditFeedModalOpen, setIsEditFeedModalOpen] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState([]);


  const fetchJoinedCommunities = useCallback(async () => {
    try {
      const res = await fetch('/api/memberships/joined', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch joined communities.");

      const data = await res.json();
      // FIX: Ensure all fetched IDs are stored as strings for reliable comparison
      setJoinedCommunities(data.map(comm => comm._id.toString()));
    } catch (err) {
      console.error("Error fetching joined communities:", err);
    }
  }, []);

  const handleToggleJoin = useCallback(async (communityName, communityId) => {
    const isCurrentlyJoined = joinedCommunities.includes(communityId);
    const method = isCurrentlyJoined ? 'DELETE' : 'POST';
    const apiEndpoint = isCurrentlyJoined ? '/api/memberships/unjoin' : '/api/memberships/join';

    // Optimistic UI Update
    setJoinedCommunities(prev =>
      isCurrentlyJoined
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );

    try {
      const res = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId }), // Pass the string ID
      });

      if (!res.ok) {
        alert(`Failed to ${isCurrentlyJoined ? 'leave' : 'join'} r/${communityName}. Please try again.`);
        fetchJoinedCommunities(); // Re-sync state on failure
      }

    } catch (err) {
      console.error("Error toggling join:", err);
      alert('An unexpected error occurred.');
      fetchJoinedCommunities(); // Re-sync state on error
    }
  }, [joinedCommunities, fetchJoinedCommunities]);


  const fetchPosts = useCallback(async (feedData) => {

    const communityIds = feedData.communities.map(c => {
      const id = typeof c === 'object' && c !== null ? c._id : c;
      return id ? id.toString() : null; // Convert to string before filter
    }).filter(id => id);

    if (communityIds.length === 0) {
      setPosts([]);
      return;
    }

    setLoadingPosts(true);
    try {
      const res = await fetch('/api/posts/custom-feed-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityIds }),
      });

      if (!res.ok) throw new Error('Failed to fetch custom feed posts');

      const data = await res.json();
      setPosts(data);

    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);


  const fetchFeedDetails = useCallback(async (shouldFetchPosts = true) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customfeeds/name/${feedName}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Feed not found or inaccessible.");
      }
      const data = await res.json();
      setFeed(data);

      if (shouldFetchPosts) {
        fetchPosts(data);
      }

    } catch (err) {
      console.error("Error fetching custom feed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [feedName, fetchPosts]);

  const handleOpenEditFeedModal = () => setIsEditFeedModalOpen(true);
  const handleCloseEditFeedModal = () => setIsEditFeedModalOpen(false);

  const handleEditFeedSubmit = async (updatedFeedData) => {
    try {
      const res = await fetch(`/api/customfeeds/name/${feedName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFeedData),
      });

      if (!res.ok) throw new Error('Failed to update feed metadata.');

      const newFeed = await res.json();
      setFeed(newFeed);
      handleCloseEditFeedModal();

    } catch (err) {
      console.error("Error updating feed:", err);
      alert('Failed to save changes: ' + err.message);
    }
  };

  useEffect(() => {
    fetchFeedDetails();
    fetchJoinedCommunities(); 
  }, [fetchFeedDetails, fetchJoinedCommunities]);


  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCommunityAdded = useCallback(async (updatedFeedFromServer) => {
  const currentFeedName = feedName; 
    const communityIds = updatedFeedFromServer.communities.map(c => c._id); 
  
  try {
    const url = `/api/customfeeds/name/${currentFeedName}/communities`; 
    
    console.log("Sending community update request to:", url);
    console.log("Payload:", { communities: communityIds });

    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communities: communityIds }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save communities list on the server.');
    }
    
    const newFeed = await res.json();
    
    setFeed(newFeed);
    fetchPosts(newFeed);
    handleCloseModal(); 

  } catch (err) {
    console.error("Error updating communities:", err);
    alert("Error updating communities: " + err.message);
  }

}, [feedName, fetchPosts, handleCloseModal]);

  if (loading) {
    return (
      <div className="main">
        <p style={{ textAlign: "center", marginTop: "20px" }}>Loading feed...</p>
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="main">
        <p style={{ textAlign: "center", marginTop: "20px", color: 'red' }}>Error: {error || "Feed not found."}</p>
      </div>
    );
  }

  const communityCount = feed.communities ? feed.communities.length : 0;
  const isCreator = true;

  return (
    <>
      <Header />
      <Sidebar />
      <div className="main">
        <div className="custom-feed-header">
          <div className="custom-feed-info-wrapper">
            <div className="custom-feed-icon">
              <img src={feed.image || "../images/default-feed-icon.svg"} alt="Feed Icon" />
            </div>
            <div>
              <h1 className="custom-feed-title">{feed.name}</h1>
              <p className="custom-feed-creator">
                Created by {feed.author?.username || 'u/Unknown'}
              </p>
            </div>
          </div>
          <div className="custom-feed-header-actions">
            <button className="icon-button"><img src="../images/dots.svg" alt="More" /></button>
            {isCreator && (
              <button className="icon-button" onClick={handleOpenEditFeedModal}>
                <img src="../images/edit.svg" alt="Edit Metadata" />
              </button>
            )}
          </div>
        </div>

        <div className="custom-feed-content-wrapper">
          <div className="custom-feed-main-column">
            {communityCount === 0 ? (
              <div className="custom-feed-empty-state">
                <h2>This feed doesn't have any communities yet</h2>
                <p>Add some and get this feed started</p>
                <button
                  className="add-communities-button"
                  onClick={handleOpenModal}
                >
                  Add Communities
                </button>
              </div>
            ) : (
              <div className="posts-container">
                {loadingPosts ? (
                  <p style={{ textAlign: "center" }}>Loading posts...</p>
                ) : posts.length === 0 ? (
                  <p style={{ textAlign: "center" }}>No posts found in these communities.</p>
                ) : (
                  posts.map(post => {
                    const communityIdString = post.community?._id?.toString();
                    const isMember = communityIdString ? joinedCommunities.includes(communityIdString) : false;

                    return (
                      <Post
                        key={post._id}
                        postId={post._id}
                        username={post.author?.username}
                        avatar={post.author?.avatarUrl}
                        time={post.createdAt}
                        title={post.title}
                        textPreview={post.body}
                        preview={post.mediaUrl}
                        initialVotes={post.score}
                        initialComments={post.commentCount}

                        isAllFeed={true}
                        community={post.community?.name}
                        communityAvatarUrl={post.community?.avatar}
                        isJoined={isMember}
                        onToggleJoin={() => handleToggleJoin(
                          post.community?.name,
                          communityIdString
                        )}
                      />
                    );
                  })
                )}
              </div>

            )}
          </div>

          <div className="custom-feed-right-sidebar">
            <div className="custom-feed-details-card">
              <div className="feed-info-section">
                <div className="sidebar-card-header">
                  <h3>{feed.name}</h3>
                  {isCreator &&
                    <button
                      className="edit-button-icon"
                      onClick={handleOpenEditFeedModal} 
                    >
                      <img src="../images/edit.svg" alt="Edit Feed Details" />
                    </button>
                  }
                </div>
                {feed.description && (
                  <p className="feed-description-text">
                    {feed.description}
                  </p>
                )}
                <p className="feed-private-status">
                  {feed.isPrivate && <img src="../images/eye-off.svg" alt="Private Link" />}
                  {feed.isPrivate ? 'Private' : 'Public'}
                </p>
              </div>

              <div className="feed-stats-row">
                <div className="feed-stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="feed-stat">
                  <span className="stat-number">{communityCount}</span>
                  <span className="stat-label">Communities</span>
                </div>
              </div>

              <div className="communities-section">
                <div className="sidebar-card-header">
                  <h3>COMMUNITIES</h3>
                  {isCreator &&
                    <button className="edit-button-icon" onClick={handleOpenModal}>
                      <img src="../images/edit.svg" alt="Edit Communities" />
                    </button>
                  }
                </div>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search communities"
                    className="sidebar-search-input"
                    onFocus={handleOpenModal}
                    readOnly
                  />
                  <img src="../images/search.svg" alt="Search" className="search-icon" />
                </div>
              </div>

              <div className="creator-section">
                <h3>CREATOR</h3>
                <div className="creator-info">
                  <Link to={`/profile/${feed.author?.username}`}>
                    <img src={feed.author?.avatarUrl || '../images/avatar.png'} alt="Creator Avatar" className="creator-avatar" />
                    u/{feed.author?.username || 'Unknown'}
                  </Link>
                </div>
              </div>

            </div>
            <p className="copyright-text">
              Reddit Rules Privacy Policy User Agreement<br /> Accessibility<br />
              Reddit, Inc. &copy; 2025. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && feed && (
        <AddCommunitiesModal
          feed={feed}
          onClose={handleCloseModal}
          onCommunityAdded={handleCommunityAdded}
        />
      )}

      {isEditFeedModalOpen && feed && (
        <CustomFeedPopup
          initialFeed={feed}
          onClose={handleCloseEditFeedModal}
          onSubmit={handleEditFeedSubmit}
        />
      )}
    </>

  );
}

export default CustomFeedPage;