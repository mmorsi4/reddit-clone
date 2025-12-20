import React, { useState, useEffect } from "react";
import "../styles/AddToCustom.css";
import CustomFeedPopup from "../components/CustomFeedPopup";

function FeedItem({ feed, communityId, communityName, onFeedUpdate, isCommunityInFeed }) {
  const [loading, setLoading] = useState(false);
  const [isInFeed, setIsInFeed] = useState(isCommunityInFeed);

  const handleToggleFeed = async () => {
    if (loading) return;
    setLoading(true);

    const isCurrentlyInFeed = isInFeed;
    const newCommunityIds = isCurrentlyInFeed
      ? feed.communities.filter(id => id !== communityId)
      : [...feed.communities, communityId];

    try {
      const res = await fetch(`/api/customfeeds/${feed._id}/communities`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communities: newCommunityIds }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update custom feed");
      }

      setIsInFeed(prev => !prev);
      onFeedUpdate(feed._id, !isCurrentlyInFeed);
    } catch (err) {
      console.error(`Error updating feed '${feed.name}':`, err);
      alert(`Failed to ${isCurrentlyInFeed ? 'remove from' : 'add to'} custom feed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-feed-item">
      <div className="feed-info">
        <img src={feed.image} alt="feed avatar" className="feed-avatar" />
        <div>
          <div className="feed-name">{feed.name}</div>
          <div className="feed-count">{feed.communities.length} communities</div>
        </div>
      </div>
      <button 
        className={`feed-action-btn ${isInFeed ? "remove" : "add"}`}
        onClick={handleToggleFeed}
        disabled={loading}
      >
        {loading ? "..." : (isInFeed ? "Remove" : "Add")}
      </button>
    </div>
  );
}

// Main popup component
function AddToCustom({ communityId, communityName, onClose }) {
  const [feeds, setFeeds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateFeedModal, setShowCreateFeedModal] = useState(false);

  const fetchFeeds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customfeeds", { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch custom feeds");
      }
      const data = await res.json();
      setFeeds(data);
    } catch (err) {
      console.error("Fetch custom feeds error:", err);
      setError("Failed to load custom feeds.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  // Handler to update the communities array in the local state
  const handleFeedUpdate = (feedId, added) => {
      setFeeds(prevFeeds => prevFeeds.map(feed => {
          if (feed._id !== feedId) return feed;

          // Clone the communities array and update it
          let newCommunities = [...feed.communities];
          if (added) {
              if (!newCommunities.includes(communityId)) newCommunities.push(communityId);
          } else {
              newCommunities = newCommunities.filter(id => id !== communityId);
          }

          return { ...feed, communities: newCommunities };
      }));
  };
  
  const handleCreateNewFeed = () => {
      setShowCreateFeedModal(true);
  }

  const handleCreateFeedSubmit = async ({ name, description, isPrivate, showOnProfile }) => {
    try {
      const randomIndex = Math.floor(Math.random() * 11) + 1;
      const imageUrl = `../images/custom_feed_default_${randomIndex}.png`;      
      const res = await fetch("/api/customfeeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description, 
          isPrivate, 
          showOnProfile,
          image: imageUrl, 
          initialCommunityId: communityId 
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create custom feed.");
      }

      fetchFeeds();

    } catch (err) {
      console.error("Error creating custom feed:", err);
      alert(err.message);
    } finally {
      setShowCreateFeedModal(false); 
    }
  };

  if (error) {
    return (
      <div className="custom-feed-popup-backdrop" onClick={onClose}>
        <div className="custom-feed-popup-content" onClick={e => e.stopPropagation()}>
          <h2>Add to custom feed</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom-feed-popup-backdrop" onClick={onClose}>
        <div className="custom-feed-popup-content" onClick={e => e.stopPropagation()}>
          <h2>Add to custom feed</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="custom-feed-popup-backdrop" onClick={onClose}>
      <div className="custom-feed-popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
            <h2>Add to custom feed</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {isLoading ? (
          <p>Loading your custom feeds...</p>
        ) : (
          <>
            {feeds && feeds.length > 0 ? (
              <div className="feed-list">
                {feeds.map(feed => {
                  // Check if the current communityId is in the feed's communities list
                  const isCommunityInFeed = feed.communities.includes(communityId);
                  
                  return (
                    <FeedItem
                      key={feed._id}
                      feed={feed}
                      communityId={communityId}
                      communityName={communityName}
                      onFeedUpdate={handleFeedUpdate}
                      isCommunityInFeed={isCommunityInFeed}
                    />
                  );
                })}
              </div>
            ) : (
                <p>You have no custom feeds. Create one below!</p>
            )}
            
            <button className="create-new-feed-btn" onClick={handleCreateNewFeed}>
                <img src="../images/plus.svg" alt="create" />
                Create a custom feed
            </button>
          </>
        )}
      </div>
    </div>
    {/* ✅ Render the new creation modal */}
      {showCreateFeedModal && (
          <CustomFeedPopup
              onClose={() => setShowCreateFeedModal(false)}
              onSubmit={handleCreateFeedSubmit}
              // We could pass an initial name if desired, but we'll leave it blank
          />
      )}
      </>
  );
}

export default AddToCustom;