import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Community from '../models/Community.js';
import Membership from '../models/Membership.js';


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
      .limit(Number(limit));

    res.json(posts);
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
      .populate('community', 'name title');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username displayName');

    res.json({ post, comments });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Vote on a post
export async function votePost(req, res) {
  try {
    const { value } = req.body; 
    if (![1, -1].includes(value)) return res.status(400).json({ message: 'Invalid vote' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.votes = post.votes || [];
    post.votes = post.votes.filter(v => v.user.toString() !== req.userId);
    post.votes.push({ user: req.userId, value });

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
      .sort({ createdAt: -1 });

    res.json(posts);
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
      .populate('community', 'name title') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json(posts);
  } catch (err) {
    console.error("Error fetching home feed posts:", err);

    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getHomeFeedPosts(req, res) {
  try {
    const { limit = 20, page = 1 } = req.query; 
    const skip = (Number(page) - 1) * Number(limit);
    const memberships = await Membership.find({ userId: req.userId }).select('communityId').lean();
    const joinedCommunityIds = memberships.map(m => m.communityId);

    if (joinedCommunityIds.length === 0) {
      return res.json([]);
    }

    const query = { 
      community: { $in: joinedCommunityIds } 
    }; 

    const posts = await Post.find(query) 
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json(posts);
  } catch (err) {
    console.error("Error fetching home feed posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
