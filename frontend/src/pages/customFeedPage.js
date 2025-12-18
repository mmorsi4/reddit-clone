import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import AddCommunitiesModal from '../pages/addcommunitiesPopup';
import CustomFeedPopup from './CustomFeedPopup';
<<<<<<< HEAD
=======
import ShareFeedPopup from '../components/ShareFeedPopup';
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
import Post from '../components/post';

function CustomFeedPage() {
  const { feedId } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditFeedModalOpen, setIsEditFeedModalOpen] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
<<<<<<< HEAD
=======
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);


>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5


  const fetchJoinedCommunities = useCallback(async () => {
    try {
      const res = await fetch('/api/memberships/joined', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch joined communities.");

      const data = await res.json();
      setJoinedCommunities(data.map(comm => comm._id.toString()));
    } catch (err) {
      console.error("Error fetching joined communities:", err);
    }
  }, []);

<<<<<<< HEAD
=======
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users", {
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
  if (feed) {
    setIsCreator(feed.isCreator);
    setIsFollowing(feed.isFollowing);
    setFollowersCount(feed.followersCount);
  }
}, [feed]);

>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
  const handleToggleJoin = useCallback(async (communityName, communityId) => {
    const isCurrentlyJoined = joinedCommunities.includes(communityId);
    const method = isCurrentlyJoined ? 'DELETE' : 'POST';
    const apiEndpoint = isCurrentlyJoined ? '/api/memberships/unjoin' : '/api/memberships/join';

    setJoinedCommunities(prev =>
      isCurrentlyJoined ? prev.filter(id => id !== communityId) : [...prev, communityId]
    );

    try {
      const res = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId }),
        credentials: "include",
      });

      if (!res.ok) {
        alert(`Failed to ${isCurrentlyJoined ? 'leave' : 'join'} r/${communityName}`);
        fetchJoinedCommunities();
      }

    } catch (err) {
      console.error("Error toggling join:", err);
      alert('An unexpected error occurred.');
      fetchJoinedCommunities();
    }
  }, [joinedCommunities, fetchJoinedCommunities]);


  const fetchPosts = useCallback(async (feedData) => {

    const communityIds = feedData.communities.map(c => {
      const id = typeof c === 'object' && c !== null ? c._id : c;
      return id ? id.toString() : null;
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
      if (!feedId) throw new Error("No feed ID provided");

      const res = await fetch(`/api/customfeeds/${feedId}`, {
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
  }, [feedId, fetchPosts]);

  const handleOpenEditFeedModal = () => setIsEditFeedModalOpen(true);
  const handleCloseEditFeedModal = () => setIsEditFeedModalOpen(false);

  const handleEditFeedSubmit = async (updatedFeedData) => {
    try {

      const res = await fetch(`/api/customfeeds/name/${feedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedFeedData.name,
          description: updatedFeedData.description,
          image: updatedFeedData.image,
          isPrivate: updatedFeedData.isPrivate,
          showOnProfile: updatedFeedData.showOnProfile
        }),
        credentials: "include"
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
    const communityIds = updatedFeedFromServer.communities.map(c => c._id);

    try {
      const url = `/api/customfeeds/${feedId}/communities`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communities: communityIds }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update communities.');
      }

      const newFeed = await res.json();
      setFeed(newFeed);
      fetchPosts(newFeed);
      handleCloseModal();

    } catch (err) {
      console.error("Error updating communities:", err);
      alert("Error updating communities: " + err.message);
    }
  }, [fetchPosts, handleCloseModal]);

  const handleToggleOptionsMenu = () => {
    setIsOptionsMenuOpen(prev => !prev);
  };

  const handleDeleteFeed = async () => {
    setIsOptionsMenuOpen(false);

    if (!window.confirm("Are you sure you want to delete this custom feed? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/customfeeds/${feedId}`, {
        method: 'DELETE',
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error('Failed to delete feed.');
      }
<<<<<<< HEAD
      navigate('/Home'); 
=======
      navigate('/Home');
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5

    } catch (err) {
      console.error("Error deleting feed:", err);
      alert("Failed to delete the custom feed. Try again.");
    }
  };


  const handleCopyFeed = async () => {
    setIsOptionsMenuOpen(false);

    try {
      const res = await fetch(`/api/customfeeds/copy/${feedId}`, {
        method: 'POST',
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error('Failed to copy feed.');
      }

      const newFeed = await res.json();

      alert(`Feed successfully copied to "${newFeed.name}"!`);
      navigate(`/Home`);

    } catch (err) {
      console.error("Error copying feed:", err);
      alert("Failed to copy the custom feed. Try again.");
    }
  };

<<<<<<< HEAD
=======
  const handleShareFeed = async (users) => {
    const feedLink = `${window.location.origin}/f/${feed._id}`;

    for (const user of users) {
      await fetch("/api/messages/share-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: user._id,
          text: `📌 Shared a custom feed with you:\n${feed.name}\n${feedLink}`
        })
      });
    }
  };

  const handleFollowToggle = async () => {
  try {
    const res = await fetch(`/api/customfeeds/${feedId}/follow`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to update follow status');

    const data = await res.json();
    setIsFollowing(data.isFollowing);
    setFollowersCount(data.followersCount);
  } catch (err) {
    console.error(err);
    alert('Failed to update follow status');
  }
};

>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5

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
<<<<<<< HEAD
  const isCreator = true;
=======
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5

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
            <button className="icon-button"><img src="../images/three-dots.svg" alt="More" /></button>
            {isCreator && (
              <button className="icon-button" onClick={handleOpenEditFeedModal}>
                <img src="../images/edit.svg" alt="Edit Metadata" />
              </button>
            )}
          </div>
        </div>

        <div className="custom-feed-header-divider">
          <div className="custom-feed-header-divider-line"></div>
          <div className="custom-feed-header-divider-spacer"></div>
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
                        initialVote={post.userVote}
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

            <div className="custom-feed-sidebar-actions-wrapper">

              <div className="custom-feed-sidebar-actions">
<<<<<<< HEAD
                <button className="icon-button sidebar-action-button">
                  <img src="../images/share.svg" alt="Share Feed" />
                </button>
=======
                <button
                  className="icon-button sidebar-action-button"
                  onClick={() => {
                    setIsShareOpen(true);
                    fetchUsers();
                  }}
                >
                  <img src="../images/share.svg" alt="Share Feed" />
                </button>

                {!isCreator && (
                  <button
                    className={`icon-button sidebar-action-button follow ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}

>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
                <button
                  className="icon-button sidebar-action-button"
                  onClick={handleToggleOptionsMenu}
                >
                  <img src="../images/three-dots.svg" alt="More Options" />
                </button>
              </div>

              {isOptionsMenuOpen && (
                <div className="custom-feed-options-menu">
<<<<<<< HEAD
=======
                  {isCreator && (
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
                  <button
                    className="options-menu-item"
                    onClick={() => {
                      handleOpenEditFeedModal();
                      setIsOptionsMenuOpen(false);
                    }}
                  >
<<<<<<< HEAD
                    <img src="../images/edit.svg" alt="Edit" />
                    Edit details
                  </button>
                  <button
                    className="options-menu-item"
                    onClick={handleCopyFeed} 
=======
                    
                    <img src="../images/edit.svg" alt="Edit" />
                    Edit details
                    
                  </button>
                  )}
                  
                    
                  <button
                    className="options-menu-item"
                    onClick={handleCopyFeed}
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
                  >
                    <img src="../images/copy.svg" alt="Copy" />
                    Copy custom feed
                  </button>
<<<<<<< HEAD
                  <button
                    className="options-menu-item delete"
                    onClick={handleDeleteFeed} 
=======
                  {isCreator &&(
                  <button
                    className="options-menu-item delete"
                    onClick={handleDeleteFeed}
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
                  >
                    <img src="../images/delete.svg" alt="Delete" />
                    Delete
                  </button>
<<<<<<< HEAD
=======
                  )}
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
                </div>
              )}
            </div>
            <div className="custom-feed-details-card">
              <div className="feed-info-section">
                <div className="sidebar-card-header">
                  <h3>{feed.name}</h3>
<<<<<<< HEAD
                  {isCreator &&
=======
                  {isCreator && (
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
                    <button
                      className="edit-button-icon"
                      onClick={handleOpenEditFeedModal}
                    >
                      <img src="../images/edit.svg" alt="Edit Feed Details" />
                    </button>
<<<<<<< HEAD
                  }
=======
                  )}
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
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
<<<<<<< HEAD
                  <span className="stat-number">0</span>
=======
                  <span className="stat-number">{followersCount}</span>
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
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
<<<<<<< HEAD
=======

      {isShareOpen && (
        <ShareFeedPopup
          feed={feed}
          users={users}
          onSend={handleShareFeed}
          onClose={() => setIsShareOpen(false)}
        />
      )}


>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
    </>

  );
}

export default CustomFeedPage;