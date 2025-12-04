// src/pages/Popular.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiHome, 
  FiTrendingUp, 
  FiMessageSquare, 
  FiCompass, 
  FiPlusCircle,
  FiChevronUp,
  FiChevronDown,
  FiMessageCircle,
  FiShare,
  FiBookmark,
  FiFlag,
  FiClock,
  FiUsers,
  FiAward,
  FiMoreHorizontal
} from 'react-icons/fi';
import { FaReddit, FaSearch, FaFire, FaRedditAlien } from 'react-icons/fa';
import { BsFillChatDotsFill, BsThreeDots } from 'react-icons/bs';

const Popular = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('best');

  useEffect(() => {
    fetchPopularPosts();
  }, [sortBy]);

  const fetchPopularPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/popular');
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch popular posts');
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Loading state
  if (loading) {
    return React.createElement(
      'div',
      { className: 'bg-reddit-dark min-h-screen pt-16' },
      React.createElement(
        'div',
        { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement(
          'div',
          { className: 'flex justify-center items-center h-96' },
          React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-reddit-orange' })
        )
      )
    );
  }

  // Error state
  if (error) {
    return React.createElement(
      'div',
      { className: 'bg-reddit-dark min-h-screen pt-16' },
      React.createElement(
        'div',
        { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement(
          'div',
          { className: 'bg-reddit-card border border-reddit-line text-reddit-text px-4 py-3 rounded' },
          error
        )
      )
    );
  }

  // Navigation Item Component
  const NavItem = ({ icon, children, active = false }) => {
    return React.createElement(
      'a',
      {
        href: '#',
        className: `flex items-center px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-reddit-orange text-white' : 'text-reddit-text hover:bg-reddit-hover'}`
      },
      icon,
      React.createElement('span', { className: 'ml-3' }, children)
    );
  };

  // Game Card Component
  const GameCard = ({ title, subtitle, players, color }) => {
    return React.createElement(
      'div',
      { className: 'flex items-start space-x-3 p-2 rounded-lg hover:bg-reddit-hover cursor-pointer' },
      React.createElement(
        'div',
        { className: `${color} w-12 h-12 rounded-lg flex items-center justify-center` },
        React.createElement('span', { className: 'text-lg font-bold text-gray-800' }, '🎮')
      ),
      React.createElement(
        'div',
        { className: 'flex-1' },
        React.createElement('h4', { className: 'font-semibold text-reddit-text text-sm' }, title),
        React.createElement('p', { className: 'text-xs text-reddit-text-light' }, subtitle),
        React.createElement('p', { className: 'text-xs text-reddit-text-lighter mt-1' }, players)
      )
    );
  };

  // Community Card Component
  const CommunityCard = ({ name, members, trending = false }) => {
    const trendingBadge = trending ? React.createElement(
      'span',
      { className: 'bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded' },
      'TRENDING'
    ) : null;

    return React.createElement(
      'div',
      { className: 'flex items-center justify-between p-2 rounded-lg hover:bg-reddit-hover cursor-pointer' },
      React.createElement(
        'div',
        { className: 'flex items-center space-x-3' },
        React.createElement('div', { className: 'w-10 h-10 bg-gradient-to-r from-reddit-orange to-red-500 rounded-full flex items-center justify-center' },
          React.createElement(FaRedditAlien, { className: 'w-6 h-6 text-white' })
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: 'flex items-center space-x-1' },
            React.createElement('span', { className: 'font-semibold text-reddit-text' }, name),
            trendingBadge
          ),
          React.createElement('p', { className: 'text-xs text-reddit-text-light' }, members)
        )
      ),
      React.createElement(
        'button',
        { className: 'text-sm font-semibold text-white bg-reddit-orange hover:bg-reddit-orange-dark px-3 py-1 rounded-full' },
        'Join'
      )
    );
  };

  // Post Card Component - Reddit Style
  const PostCard = ({ post, formatTime }) => {
    const [upvoted, setUpvoted] = useState(false);
    const [downvoted, setDownvoted] = useState(false);

    const communitySection = post.community ? [
      React.createElement('img', {
        key: 'avatar',
        src: post.community.avatar || `https://ui-avatars.com/api/?name=${post.community?.name || 'r'}&background=FF4500&color=fff&bold=true&size=40`,
        alt: post.community.name,
        className: 'w-5 h-5 rounded-full mr-1 border border-reddit-line',
        onError: (e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?name=${post.community?.name || 'r'}&background=FF4500&color=fff&bold=true&size=40`;
        }
      }),
      React.createElement('span', {
        key: 'name',
        className: 'font-bold text-reddit-text hover:underline cursor-pointer text-xs'
      }, `r/${post.community.name}`),
      React.createElement('span', { key: 'dot', className: 'mx-1 text-reddit-text-light' }, '•')
    ] : null;

    const mediaSection = post.mediaUrl ? React.createElement(
      'div',
      { className: 'mt-3 mb-2 rounded border border-reddit-line overflow-hidden' },
      post.mediaUrl.match(/\.(mp4|mov|avi)$/i) 
        ? React.createElement('video', {
            src: post.mediaUrl,
            className: 'w-full max-h-96 object-contain bg-black',
            controls: true
          })
        : React.createElement('img', {
            src: post.mediaUrl,
            alt: post.title,
            className: 'w-full max-h-96 object-contain cursor-pointer',
            onError: (e) => {
              e.target.style.display = 'none';
            }
          })
    ) : null;

    const bodySection = post.body ? React.createElement(
      'div',
      { className: 'mt-2 text-reddit-text text-sm' },
      React.createElement('p', { className: 'line-clamp-6' }, post.body)
    ) : null;

    // Calculate vote percentage for bar
    const upvotes = post.votes ? post.votes.filter(v => v.value === 1).length : 0;
    const downvotes = post.votes ? post.votes.filter(v => v.value === -1).length : 0;
    const totalVotes = upvotes + downvotes;
    const votePercentage = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

    return React.createElement(
      'div',
      { className: 'bg-reddit-card border border-reddit-line rounded-md mb-3 hover:border-reddit-text-lighter transition-colors' },
      React.createElement(
        'div',
        { className: 'flex' },
        // Vote Section - Reddit Style
        React.createElement(
          'div',
          { className: 'w-10 bg-reddit-card flex flex-col items-center pt-2 rounded-l-md' },
          React.createElement(
            'button',
            {
              onClick: () => {
                setUpvoted(!upvoted);
                setDownvoted(false);
              },
              className: `p-1 ${upvoted ? 'text-reddit-orange' : 'text-reddit-text-light hover:bg-reddit-hover hover:text-reddit-orange'} rounded`
            },
            React.createElement(FiChevronUp, { className: 'w-6 h-6' })
          ),
          React.createElement('span', {
            className: `font-bold text-xs py-1 ${upvoted ? 'text-reddit-orange' : downvoted ? 'text-blue-500' : 'text-reddit-text'}`
          }, post.score),
          React.createElement(
            'button',
            {
              onClick: () => {
                setDownvoted(!downvoted);
                setUpvoted(false);
              },
              className: `p-1 ${downvoted ? 'text-blue-500' : 'text-reddit-text-light hover:bg-reddit-hover hover:text-blue-500'} rounded`
            },
            React.createElement(FiChevronDown, { className: 'w-6 h-6' })
          ),
          // Vote bar indicator
          totalVotes > 0 && React.createElement('div', {
            className: 'w-1 h-16 bg-reddit-line rounded-full mt-2 overflow-hidden',
            key: 'vote-bar'
          },
            React.createElement('div', {
              className: 'bg-reddit-orange w-full',
              style: { height: `${votePercentage}%` }
            })
          )
        ),
        // Content Section
        React.createElement(
          'div',
          { className: 'flex-1 p-3' },
          // Post Header
          React.createElement(
            'div',
            { className: 'flex items-center text-xs text-reddit-text-light mb-1' },
            communitySection,
            React.createElement('span', {
              className: 'hover:text-reddit-text cursor-pointer'
            }, `Posted by u/${post.author?.username || 'Anonymous'}`),
            React.createElement('span', { className: 'mx-1' }, '•'),
            React.createElement('span', null, formatTime(post.createdAt)),
            React.createElement('div', {
              className: 'ml-auto flex items-center space-x-1'
            },
              React.createElement('button', {
                className: 'p-1 hover:bg-reddit-hover rounded'
              },
                React.createElement(BsThreeDots, { className: 'w-4 h-4' })
              )
            )
          ),
          // Post Title
          React.createElement(
            'h2',
            { className: 'text-lg font-medium text-reddit-text mb-2 hover:text-reddit-text-light cursor-pointer' },
            post.title
          ),
          bodySection,
          mediaSection,
          // Post Stats - Reddit Style
          React.createElement(
            'div',
            { className: 'flex items-center text-xs text-reddit-text-light mt-3' },
            React.createElement(
              'button',
              { className: 'flex items-center space-x-1 hover:bg-reddit-hover px-2 py-1.5 rounded' },
              React.createElement(BsFillChatDotsFill, { className: 'w-4 h-4' }),
              React.createElement('span', { className: 'font-medium' }, `${post.commentCount || 0} Comments`)
            ),
            React.createElement(
              'button',
              { className: 'flex items-center space-x-1 hover:bg-reddit-hover px-2 py-1.5 rounded ml-2' },
              React.createElement(FiShare, { className: 'w-4 h-4' }),
              React.createElement('span', null, 'Share')
            ),
            React.createElement(
              'button',
              { className: 'flex items-center space-x-1 hover:bg-reddit-hover px-2 py-1.5 rounded ml-2' },
              React.createElement(FiBookmark, { className: 'w-4 h-4' }),
              React.createElement('span', null, 'Save')
            ),
            React.createElement(
              'button',
              { className: 'flex items-center space-x-1 hover:bg-reddit-hover px-2 py-1.5 rounded ml-2' },
              React.createElement(FiAward, { className: 'w-4 h-4' }),
              React.createElement('span', null, 'Award')
            ),
            // Popularity Badge - Moved to right
            React.createElement('div', {
              className: 'ml-auto flex items-center space-x-2'
            },
              React.createElement(
                'div',
                { className: 'flex items-center bg-reddit-orange bg-opacity-10 text-reddit-orange px-2 py-1 rounded-full text-xs font-semibold' },
                React.createElement(FiTrendingUp, { className: 'w-3 h-3 mr-1' }),
                `Popularity: ${post.popularityScore || 0}`
              )
            )
          )
        )
      )
    );
  };

  // Sort buttons - Reddit Style
  const sortButtons = ['best', 'hot', 'new', 'top'].map((sortType) => 
    React.createElement(
      'button',
      {
        key: sortType,
        className: `px-4 py-2 text-sm font-medium rounded-full mr-2 ${sortBy === sortType ? 'bg-reddit-orange text-white' : 'bg-reddit-card text-reddit-text hover:bg-reddit-hover'}`,
        onClick: () => setSortBy(sortType)
      },
      sortType.charAt(0).toUpperCase() + sortType.slice(1)
    )
  );

  // Popular topics
  const popularTopics = ['Gaming', 'Sports', 'News', 'Movies', 'Music', 'Technology', 'Science', 'Art'].map((topic) =>
    React.createElement(
      'span',
      {
        key: topic,
        className: 'inline-block bg-reddit-card text-reddit-text text-sm px-3 py-1.5 rounded-full hover:bg-reddit-hover cursor-pointer mr-2 mb-2'
      },
      topic
    )
  );

  // Main return
  return React.createElement(
    'div',
    { className: 'bg-reddit-dark min-h-screen pt-16' },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' },
      React.createElement(
        'div',
        { className: 'flex gap-6' },
        // Left Sidebar - Reddit Style
        React.createElement(
          'div',
          { className: 'hidden lg:block w-64 flex-shrink-0' },
          React.createElement(
            'div',
            { className: 'sticky top-20' },
            // Navigation
            React.createElement(
              'div',
              { className: 'bg-reddit-card border border-reddit-line rounded-md p-3 mb-4' },
              React.createElement(
                'nav',
                { className: 'space-y-1' },
                React.createElement(NavItem, { 
                  icon: React.createElement(FiHome, { className: 'w-5 h-5' }), 
                  active: false 
                }, 'Home'),
                React.createElement(NavItem, { 
                  icon: React.createElement(FiTrendingUp, { className: 'w-5 h-5' }), 
                  active: true 
                }, 'Popular'),
                React.createElement(NavItem, { 
                  icon: React.createElement(FiMessageSquare, { className: 'w-5 h-5' }) 
                }, 'All'),
                React.createElement(NavItem, { 
                  icon: React.createElement(FiCompass, { className: 'w-5 h-5' }) 
                }, 'Explore'),
                React.createElement(NavItem, { 
                  icon: React.createElement(FaReddit, { className: 'w-5 h-5 text-reddit-orange' }) 
                }, 'Reddit Premium'),
                React.createElement(NavItem, { 
                  icon: React.createElement(FiPlusCircle, { className: 'w-5 h-5' }) 
                }, 'Create Community')
              )
            ),
            // Games Section
            React.createElement(
              'div',
              { className: 'bg-reddit-card border border-reddit-line rounded-md p-4' },
              React.createElement('h3', { className: 'font-bold text-reddit-text mb-3 text-sm uppercase tracking-wide' }, 'GAMES ON REDDIT'),
              React.createElement(
                'div',
                { className: 'space-y-3' },
                React.createElement(GameCard, {
                  title: 'Pocket Grids',
                  subtitle: 'Daily mini crosswords',
                  players: '1M monthly players',
                  color: 'bg-blue-500'
                }),
                React.createElement(GameCard, {
                  title: 'Hot and Cold',
                  subtitle: 'Farm Merge Valley',
                  players: 'Popular Game',
                  color: 'bg-green-500'
                }),
                React.createElement(GameCard, {
                  title: 'Ninigrams',
                  subtitle: 'Word puzzle',
                  players: 'New Game',
                  color: 'bg-purple-500'
                })
              )
            )
          )
        ),
        // Main Content
        React.createElement(
          'div',
          { className: 'flex-1' },
          // Header - Reddit Style
          React.createElement(
            'div',
            { className: 'bg-reddit-card border border-reddit-line rounded-md p-4 mb-4' },
            React.createElement(
              'div',
              { className: 'flex items-center justify-between' },
              React.createElement(
                'div',
                { className: 'flex items-center space-x-4' },
                React.createElement(
                  'div',
                  { className: 'flex items-center' },
                  React.createElement(
                    'div',
                    { className: 'w-10 h-10 rounded-full bg-gradient-to-r from-reddit-orange to-red-500 flex items-center justify-center' },
                    React.createElement(FaFire, { className: 'w-6 h-6 text-white' })
                  ),
                  React.createElement('h1', { className: 'ml-3 text-xl font-bold text-reddit-text' }, 'Popular Posts')
                ),
                React.createElement(
                  'span',
                  { className: 'bg-reddit-orange text-white text-xs font-semibold px-2.5 py-1 rounded-full' },
                  `${posts.length} posts`
                )
              ),
              // Sort Options
              React.createElement(
                'div',
                { className: 'flex items-center' },
                sortButtons
              )
            )
          ),
          // Posts Container
          React.createElement(
            'div',
            null,
            posts.map((post) => 
              React.createElement(PostCard, {
                key: post._id,
                post: post,
                formatTime: formatTime
              })
            )
          )
        ),
        // Right Sidebar
        React.createElement(
          'div',
          { className: 'hidden xl:block w-80 flex-shrink-0' },
          React.createElement(
            'div',
            { className: 'sticky top-20 space-y-6' },
            // Search - Reddit Style
            React.createElement(
              'div',
              { className: 'relative' },
              React.createElement(
                'div',
                { className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none' },
                React.createElement(FaSearch, { className: 'h-5 w-5 text-reddit-text-light' })
              ),
              React.createElement('input', {
                type: 'text',
                className: 'block w-full pl-10 pr-3 py-2.5 border border-reddit-line rounded-md bg-reddit-card text-reddit-text focus:outline-none focus:ring-1 focus:ring-reddit-orange focus:border-reddit-orange',
                placeholder: 'Search Reddit'
              })
            ),
            // Trending Communities
            React.createElement(
              'div',
              { className: 'bg-reddit-card border border-reddit-line rounded-md p-4' },
              React.createElement('h3', { className: 'font-bold text-reddit-text mb-3' }, 'Trending Communities'),
              React.createElement(
                'div',
                { className: 'space-y-3' },
                React.createElement(CommunityCard, {
                  name: 'r/news',
                  members: '32M members',
                  trending: true
                }),
                React.createElement(CommunityCard, {
                  name: 'r/lego',
                  members: '2.4M members'
                }),
                React.createElement(CommunityCard, {
                  name: 'r/Music',
                  members: '33M members'
                }),
                React.createElement(CommunityCard, {
                  name: 'r/popculturechat',
                  members: '1.2M members'
                }),
                React.createElement(
                  'button',
                  { className: 'w-full text-center text-reddit-orange font-semibold py-2 hover:bg-reddit-hover rounded-md' },
                  'View All'
                )
              )
            ),
            // Reddit Premium
            React.createElement(
              'div',
              { className: 'bg-gradient-to-r from-reddit-orange to-red-500 rounded-md p-4 text-white' },
              React.createElement(
                'div',
                { className: 'flex items-start justify-between mb-2' },
                React.createElement(FiAward, { className: 'w-8 h-8' }),
                React.createElement('span', { className: 'bg-white text-reddit-orange text-xs font-bold px-2 py-1 rounded' }, 'AD')
              ),
              React.createElement('h4', { className: 'font-bold text-lg mb-2' }, 'Reddit Premium'),
              React.createElement('p', { className: 'text-sm opacity-90 mb-4' }, 'The best Reddit experience, with monthly Coins'),
              React.createElement(
                'button',
                { className: 'w-full bg-white text-reddit-orange font-semibold py-2 rounded-full hover:bg-gray-100' },
                'Try Now'
              )
            ),
            // Popular Topics
            React.createElement(
              'div',
              { className: 'bg-reddit-card border border-reddit-line rounded-md p-4' },
              React.createElement('h3', { className: 'font-bold text-reddit-text mb-3' }, 'Popular Topics'),
              React.createElement(
                'div',
                { className: 'flex flex-wrap' },
                popularTopics
              )
            )
          )
        )
      )
    )
  );
};

export default Popular;