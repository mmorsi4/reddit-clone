import React, { useState, useEffect, useCallback } from 'react';
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import '../styles/Explore.css'; 


const API_BASE_URL = '/api/communities'; 
const MEMBERSHIP_API_URL = '/api/memberships'; 

const TOPIC_TABS = [
  'All',
  'Technology',
  'Gaming',
  'Art',
  'Music',
  'Movies',
  'Coding',
  'Cooking',
  'Books',
  'Travel',
  'Fitness',
  'Fashion',
  'Science',
];


function Explore() {
  const [activeTopic, setActiveTopic] = useState('All');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommunities = useCallback(async (topic) => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (topic === 'All') {
        url = `${API_BASE_URL}`; 
      } else {
        url = `${API_BASE_URL}/filter?topic=${topic}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const communitiesWithState = data.map(c => ({ 
          ...c, 
          isMember: c.isMember || false 
      }));

      setCommunities(communitiesWithState);

    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities. Please check your network or API connection.");
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities(activeTopic);
  }, [activeTopic, fetchCommunities]); 

  const handleTopicClick = (topic) => {
    setActiveTopic(topic);
  };

  const handleJoin = async (communityId, currentlyMember) => {
    const action = currentlyMember ? 'unjoin' : 'join';
    const url = `${MEMBERSHIP_API_URL}/${action}`;
    const method = 'POST';

    setCommunities(prevCommunities => 
        prevCommunities.map(c => 
            c._id === communityId ? { ...c, isMember: !currentlyMember } : c
        )
    );

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ communityId }),
      });

      if (!response.ok) {
        setCommunities(prevCommunities => 
            prevCommunities.map(c => 
                c._id === communityId ? { ...c, isMember: currentlyMember } : c
            )
        );
        throw new Error(`Failed to ${action} community. Status: ${response.status}`);
      }

    } catch (err) {
      console.error(`Error during ${action}:`, err);
      setError(`Failed to ${action} community. Try again.`);
      setCommunities(prevCommunities => 
        prevCommunities.map(c => 
            c._id === communityId ? { ...c, isMember: currentlyMember } : c
        )
      );
    }
  };


  const renderCommunityCard = (community) => {
    const isMember = community.isMember; 
    
    return (
        <div key={community._id} className="explore-community-card">
            <div className="explore-community-icon-wrapper">
                <img 
                    src={community.avatar || '/default-avatar.png'} 
                    alt={`${community.name} icon`} 
                    className="explore-community-avatar" 
                />
            </div>
            
            <div className="explore-community-info">
                <h3 className="explore-community-name">r/{community.name}</h3>
                <p className="explore-community-topics-hint">
                    {community.topics && community.topics.length > 0 ? community.topics.slice(0, 2).join(' • ') : 'General'}
                </p>
            </div>
            
            <button 
                className={`explore-community-join-btn ${isMember ? 'explore-community-join-btn--joined' : ''}`}
                onClick={() => handleJoin(community._id, isMember)}
            >
                {isMember ? 'Joined' : 'Join'}
            </button>
        </div>
    );
  };

  return (
    <>
      <Header/>
      <Sidebar/>
      <main className="explore-main-content">
        <h2>Explore Communities</h2>

        <div className="explore-topic-tabs-bar">
          {TOPIC_TABS.map((topic) => (
            <button
              key={topic}
              className={`explore-topic-tab ${activeTopic === topic ? 'explore-topic-tab--active' : ''}`}
              onClick={() => handleTopicClick(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <hr className="explore-divider"/>

        <section className="explore-community-list-section">
          <h3>Recommended for you</h3>

          {loading && <p className="explore-loading-message">Loading communities...</p>}
          {error && <p className="explore-error-message">{error}</p>}
          
          {!loading && !error && (
            <>
              {communities.length > 0 ? (
                <div className="explore-community-grid">
                  {communities.map(renderCommunityCard)}
                </div>
              ) : (
                <p className="explore-no-results">
                    No communities found for the topic: **{activeTopic}**.
                </p>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default Explore;