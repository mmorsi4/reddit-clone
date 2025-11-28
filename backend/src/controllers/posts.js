import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Community from '../models/Community.js';
import Membership from '../models/Membership.js';
import mongoose from 'mongoose';


export async function createPost(req,res){
  const { title, body, url, community } = req.body;
  const file = req.file;
  const post = await Post.create({ title, body, url, community, author: req.userId, mediaUrl: file ? `/uploads/${file.filename}` : null, });
  res.status(201).json(post);
}

export async function getPosts(req, res) {
  try {
    const { community: communityName, limit = 20, page = 1, sort = 'hot' } = req.query;
    let query = {};

    if (communityName) {
      const comm = await Community.findOne({ name: communityName });
      if (!comm) return res.status(404).json({ message: "Community not found" });
      query.community = comm._id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      console.log(post.commentCount)
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score,
          commentCount: post.commentCount
        };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get a single post with comments
export async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title')
      .lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username displayName')
      .lean();

    // Add vote information to each comment
    const commentsWithVotes = comments.map(comment => {
     
      const userVote = comment.votes?.find(v => v.user && v.user.toString() === req.userId);
      const score = comment.votes?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
      
      return {
        ...comment,
        userVote: userVote ? userVote.value : 0,
        upvotes: score,
        score: score
      };
    });

    res.json({ post, comments: commentsWithVotes });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function votePost(req, res) {
  try {
    const { value } = req.body; // 1, -1, or 0
    if (![1, -1, 0].includes(value)) return res.status(400).json({ message: 'Invalid vote' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.votes = post.votes || [];
    post.votes = post.votes.filter(v => v.user.toString() !== req.userId);
    if (value !== 0) {
      post.votes.push({ user: req.userId, value });
    }

    await post.save();
    const score = post.votes.reduce((s, v) => s + v.value, 0);
    res.json({ score });
  } catch (err) {
    console.error("Error voting on post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add this function to your posts controller
export async function getMyPosts(req, res) {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title')
      .sort({ createdAt: -1 })
      .lean();

  const normalized = posts.map(post => {
    const userVote = post.votes?.find(v => v.user.toString() === req.userId);
    const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
    return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score,
        commentCount: post.commentCount ?? 0
      };
  });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllFeedPosts(req, res) {
  try {
    const { limit = 20, page = 1 } = req.query; 
    const skip = (Number(page) - 1) * Number(limit);

    const query = { community: { $exists: true, $ne: null } }; 

    const posts = await Post.find(query) 
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score,
          commentCount: post.commentCount ?? 0
        };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching home feed posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function getCustomFeedPosts(req, res) {
  try {
    const { communityIds } = req.body; 

    if (!Array.isArray(communityIds) || communityIds.length === 0) {
      return res.status(200).json([]);
    }

    const objectCommunityIds = communityIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        console.error("Invalid ID encountered:", id, e);
        return null; 
      }
    }).filter(id => id !== null);
    
    if (objectCommunityIds.length === 0) {
        return res.status(200).json([]);
    }

    const { limit = 20, page = 1 } = req.query; 
    const skip = (Number(page) - 1) * Number(limit);

    const query = { community: { $in: objectCommunityIds } }; 

    const posts = await Post.find(query) 
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score,
          commentCount: post.commentCount ?? 0
        };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching custom feed posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Repeat the same pattern for Best, New, Top posts:
export async function getHomeBestPosts(req, res) {
  try {
    const { limit = 20, page = 1, home } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = { community: { $exists: true, $ne: null } };

    if (home === "true" && req.userId) {
      const memberships = await Membership.find({ userId: req.userId }).select('communityId').lean();
      const joinedCommunityIds = memberships.map(m => m.communityId);
      query.community = { $in: joinedCommunityIds };
    }

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .sort({ votesScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score,
          commentCount: post.commentCount ?? 0
        };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching Best posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getHomeNewPosts(req, res) {
  try {
    const { limit = 20, page = 1, home } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = { community: { $exists: true, $ne: null } };

    if (home === "true" && req.userId) {
      const memberships = await Membership.find({ userId: req.userId }).select('communityId').lean();
      const joinedCommunityIds = memberships.map(m => m.communityId);
      query.community = { $in: joinedCommunityIds };
    }

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score,
          commentCount: post.commentCount ?? 0
        };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching New posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getHomeTopPosts(req, res) {
  try {
    const { limit = 20, page = 1, home } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = { community: { $exists: true, $ne: null } };

    if (home === "true" && req.userId) {
      const memberships = await Membership.find({ userId: req.userId }).select('communityId').lean();
      const joinedCommunityIds = memberships.map(m => m.communityId);
      query.community = { $in: joinedCommunityIds };
    }

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .sort({ 'votes.length': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score,
          commentCount: post.commentCount ?? 0
        };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching Top posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}