import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// Create a new post
export async function createPost(req, res) {
  try {
    const { title, body, url, community } = req.body;
    if (!title || !community) {
      return res.status(400).json({ message: "Title and community are required" });
    }

    const post = await Post.create({
      title,
      body,
      url,
      community,
      author: req.userId
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get posts (with optional community filter, pagination, sorting)
export async function getPosts(req, res) {
  try {
    const { community, limit = 20, page = 1, sort = 'hot' } = req.query;
    const query = community ? { community } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const posts = await Post.find(query)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title')
      .sort({ createdAt: -1 }) // You can change this based on `sort`
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
      .populate('author', 'username displayName');

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
    const { value } = req.body; // 1 or -1
    if (![1, -1].includes(value)) return res.status(400).json({ message: 'Invalid vote' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Make sure votes array exists
    post.votes = post.votes || [];

    // Remove existing vote by this user
    post.votes = post.votes.filter(v => v.user.toString() !== req.userId);

    // Add new vote
    post.votes.push({ user: req.userId, value });

    await post.save();

    const score = post.votes.reduce((s, v) => s + v.value, 0);
    res.json({ score });
  } catch (err) {
    console.error("Error voting on post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}