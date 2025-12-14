import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Community from '../models/Community.js';
import Membership from '../models/Membership.js';
import mongoose from 'mongoose';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import path from 'path'
import fs from 'fs'

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

// Get a single post with comments (with proper nesting for replies)
export async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title')
      .lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Fetch all comments for this post
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username displayName avatarUrl')
      .lean();

    // Build nested comment structure
    const buildCommentTree = (comments, parentId = null) => {
      return comments
        .filter(comment => {
          // Handle both null and undefined parent values
          const commentParent = comment.parent;
          if (parentId === null) {
            return commentParent === null || commentParent === undefined;
          }
          return commentParent && commentParent.toString() === parentId.toString();
        })
        .map(comment => {
          // Add vote information to each comment
          const userVote = comment.votes?.find(v => v.user && v.user.toString() === req.userId);
          const score = comment.votes?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
          
          return {
            ...comment,
            userVote: userVote ? userVote.value : 0,
            upvotes: score,
            score: score,
            replies: buildCommentTree(comments, comment._id) // Recursively build replies
          };
        });
    };

    const nestedComments = buildCommentTree(comments);

    res.json({ post, comments: nestedComments });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getPostSummary(req, res) {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const messages = [
      {
        role: "system",
        content:
          "You are an assistant that summarizes social media (Reddit) posts. " +
          "If the post is text-only, summarize the text clearly. " +
          "If an image exists, describe its content and combine it with the text. " +
          "If a video exists, do NOT attempt to analyze the actual video file, but acknowledge it is a video and summarize based on any textual context. " +
          "Be concise and factual." +
          "Do not mention that you are guessing or inferring." +
          "Refuse to summarize any explicit content."
      }
    ];

    const userContent = [{ type: "text", text: `Title:\n${post.title}` }];

    if (post.body) {
      userContent.push({ type: "text", text: `Body:\n${post.body}` });
    }

    if (post.mediaUrl) {
      const ext = path.extname(post.mediaUrl).toLowerCase();
      const mimeMap = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        const imagePath = path.join(process.cwd(), post.mediaUrl);
        const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
        const mime = mimeMap[ext] || "image/jpeg";
        userContent.push({ type: "image_url", image_url: { url: `data:${mime};base64,${imageBase64}` } });
      } else if ([".mp4", ".webm"].includes(ext)) {
        userContent.push({
          type: "text",
          text: `Media: This post contains a video file (${ext}). Please summarize based on the text context, ignoring the actual video content.`
        });
      }
    }

    messages.push({ role: "user", content: userContent });

    const client = ModelClient(
      "https://models.github.ai/inference",
      new AzureKeyCredential(process.env.GITHUB_MODELS_TOKEN)
    );

    const response = await client.path("/chat/completions").post({
      body: { model: "openai/gpt-4.1", messages, max_tokens: 120, temperature: 0.4 }
    });

    if (isUnexpected(response)) throw response.body.error;

    res.json({ summary: response.body.choices[0].message.content });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Failed to generate summary" });
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
      .populate('community', 'name title avatar _id') // ✨ FIXED: Added 'avatar' and '_id'
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
      .sort({ score: -1, createdAt: -1 }) // Sort by score field (already calculated in pre-save)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user && v.user.toString() === req.userId);
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score: post.score || 0,
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
      const userVote = post.votes?.find(v => v.user && v.user.toString() === req.userId);
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score: post.score || 0,
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

    // Use aggregation pipeline for better performance with vote count
    const posts = await Post.aggregate([
      { $match: query },
      { 
        $addFields: {
          voteCount: { $size: { $ifNull: ["$votes", []] } } // Calculate number of votes
        }
      },
      { $sort: { voteCount: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            { $project: { username: 1, displayName: 1, avatarUrl: 1 } }
          ]
        }
      },
      { $unwind: '$author' },
      {
        $lookup: {
          from: 'communities',
          localField: 'community',
          foreignField: '_id',
          as: 'community',
          pipeline: [
            { $project: { name: 1, title: 1, avatar: 1 } }
          ]
        }
      },
      { $unwind: { path: '$community', preserveNullAndEmptyArrays: true } }
    ]);

    // Add user vote information
    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user && v.user.toString() === req.userId);
      return {
          ...post,
          userVote: userVote ? userVote.value : 0,
          score: post.score || 0,
          commentCount: post.commentCount ?? 0
        };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching Top posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function getPopularPosts(req, res) {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await Post.find({ community: { $exists: true, $ne: null } })
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .lean();

    // Calculate 24-hour score for each post
    const postsWithRecentScore = posts.map(post => {
      const recentVotes = post.votes?.filter(v => v.createdAt >= twentyFourHoursAgo) || [];
      const recentScore = recentVotes.reduce((sum, v) => sum + (v.value || 0), 0);
      return { ...post, recentScore };
    });

    // Sort by recentScore descending
    postsWithRecentScore.sort((a, b) => b.recentScore - a.recentScore);

    // Apply pagination manually
    const paginatedPosts = postsWithRecentScore.slice(skip, skip + Number(limit));

    res.json(paginatedPosts);
  } catch (err) {
    console.error("Error fetching popular posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}