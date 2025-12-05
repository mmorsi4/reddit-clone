import React, { useState } from "react";
import CommunitySearchSelector from "../components/CommunitySearchSelector";
import "../styles/addcommunitiesPopup.css";

function AddCommunitiesModal({ feed, onClose, onCommunityAdded }) {
    const [selectedCommunities, setSelectedCommunities] = useState(
        feed.communities || []
    );

    const updateFeed = async (newCommunities) => {
  if (!feed?._id) {
    alert("Feed ID is missing. Cannot update feed.");
    return;
  }

  const communityIds = newCommunities.map(c => c._id);

  try {
    const res = await fetch(`/api/customfeeds/${feed._id}/communities`, { 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ communities: communityIds }),
      credentials: "include"
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      let errorMessage = `HTTP Error ${res.status}`;

      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const updatedFeedData = await res.json();
    // Sometimes the backend returns { feed: {...} }, sometimes just the object
    const feedObjectToPass = updatedFeedData.feed || updatedFeedData;
    onCommunityAdded(feedObjectToPass);

  } catch (error) {
    console.error("Error saving communities:", error);
    alert(`Error updating feed: ${error.message}. Please try again.`);
  }
};



    const handleCommunitySelect = (communityToToggle) => {
        let newCommunities;

        if (!selectedCommunities.some(c => c._id === communityToToggle._id)) {
            newCommunities = [...selectedCommunities, communityToToggle];
        } else {
            newCommunities = selectedCommunities.filter(c => c._id !== communityToToggle._id);
        }

        setSelectedCommunities(newCommunities);
        updateFeed(newCommunities);
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-communities-modal" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h2>Add Communities to {feed.name}</h2>
                    <button className="close-button" onClick={onClose}>
                        <img src="../images/close.svg" alt="Close" />
                    </button>
                </div>

                <div className="modal-search-wrapper">
                    <CommunitySearchSelector
                        onSelectCommunity={handleCommunitySelect}
                        currentSelectedCommunities={selectedCommunities}
                    />
                </div>

                <div className="selected-communities-list">
                    {selectedCommunities.length === 0 ? (
                        <p className="selection-tip">Search for communities and click 'Add' to select them.</p>
                    ) : (
                        <>
                            <ul>
                                {selectedCommunities.map(c => (
                                    <li key={c._id} className="selected-community-item">
                                        <div className="community-info">
                                            <img src={c.avatar || "../images/community-avatar-placeholder.png"} alt={c.name} />
                                            <span>r/{c.name}</span>
                                        </div>
                                        <button className="remove-button" onClick={() => handleCommunitySelect(c)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                
            </div>
        </div>
    );
}

export default AddCommunitiesModal;