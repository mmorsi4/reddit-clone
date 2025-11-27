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

    // 1. Determine URL for ALL communities (filtered by topic)
    const allCommunitiesUrl = topic === 'All' 
        ? `${API_BASE_URL}` 
        : `${API_BASE_URL}/filter?topic=${topic}`;
    
    // 2. URL for the CURRENT USER's joined communities
    const joinedCommunitiesUrl = `${MEMBERSHIP_API_URL}/joined`; 

    try {
      // Execute both fetches concurrently
      const [allResponse, joinedResponse] = await Promise.all([
        // Fetch All Communities (Does not require auth, but may need it depending on your backend)
        fetch(allCommunitiesUrl),
        
        // Fetch Joined Communities (MUST INCLUDE CREDENTIALS)
        fetch(joinedCommunitiesUrl, { credentials: "include" }) // <--- CRITICAL FIX HERE
      ]);

      if (!allResponse.ok) {
        throw new Error(`Failed to fetch all communities! Status: ${allResponse.status}`);
      }
      
      // Joined communities fetch might return 401/403 if auth fails, but 
      // if it fails, we treat the user as having no joined communities for now.
      const joinedData = joinedResponse.ok ? await joinedResponse.json() : [];
      const allData = await allResponse.json();
      
      // Create a Set for fast lookup of joined community IDs
      // Use the _id field from the joined communities data
      const joinedIds = new Set(joinedData.map(c => c._id));
      
      // Merge the status into the main list
      const mergedCommunities = allData.map(community => ({
        ...community,
        // Check if the community's ID exists in the joinedIds Set
        isMember: joinedIds.has(community._id) 
      }));

      setCommunities(mergedCommunities);

    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities or check membership status.");
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
                <p className="explore-community-topics-desc">{community.description}</p>
                <p className="explore-community-topics-hint">
                    {community.topics && community.topics.length > 0 ? community.topics.slice(0, 3).join(' • ') : 'General'}
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