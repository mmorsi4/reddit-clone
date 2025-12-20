import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Community from '../models/Community.js';
import Membership from '../models/Membership.js';
import mongoose from 'mongoose';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import path from 'path'
import fs from 'fs'
import groq from '../utils/groq.js';

export async function createPost(req, res) {
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

    // NEW: Exclude posts hidden by the current user
    if (req.userId) {
      query['hiddenBy'] = { $ne: req.userId };
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
      
      // Check if user has hidden this post
      let isHidden = false;
      if (req.userId && post.hiddenBy) {
        isHidden = post.hiddenBy.some(id => id.toString() === req.userId);
      }
      
      // Check if user has saved this post
      let isSaved = false;
      if (req.userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === req.userId);
      }
      
      console.log(post.commentCount);
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score,
        commentCount: post.commentCount,
        isHidden,
        isSaved
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title')
      .lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user has saved this post
    let isSaved = false;
    if (req.userId && post.savedBy) {
      isSaved = post.savedBy.some(id => id.toString() === req.userId);
    }

    // Check if user has hidden this post
    let isHidden = false;
    if (req.userId && post.hiddenBy) {
      isHidden = post.hiddenBy.some(id => id.toString() === req.userId);
    }

    // Add user vote info
    const userVote = post.votes?.find(v => v.user && v.user.toString() === req.userId);
    const score = post.votes?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;

    const postWithVotes = {
      ...post,
      userVote: userVote ? userVote.value : 0,
      score,
      commentCount: post.commentCount ?? 0,
      isSaved,
      isHidden,
      saves: post.saves || 0
    };

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username displayName avatarUrl')
      .lean();

    const buildCommentTree = (comments, parentId = null) => {
      return comments
        .filter(comment => {
          const commentParent = comment.parent;
          if (parentId === null) {
            return commentParent === null || commentParent === undefined;
          }
          return commentParent && commentParent.toString() === parentId.toString();
        })
        .map(comment => {
          const userVote = comment.votes?.find(v => v.user && v.user.toString() === req.userId);
          const score = comment.votes?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;

          return {
            ...comment,
            userVote: userVote ? userVote.value : 0,
            upvotes: score,
            score: score,
            replies: buildCommentTree(comments, comment._id)
          };
        });
    };

    const nestedComments = buildCommentTree(comments);

    res.json({ post: postWithVotes, comments: nestedComments });
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
          "Be concise and factual. " +
          "Do not mention that you are guessing or inferring. " +
          "Refuse to summarize any explicit content."
      }
    ];

    const userContent = [
      { type: "text", text: `Title:\n${post.title}` }
    ];

    if (post.body) {
      userContent.push({
        type: "text",
        text: `Body:\n${post.body}`
      });
    }

    if (post.mediaUrl) {
      const ext = path.extname(post.mediaUrl).toLowerCase();
      const mimeMap = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp"
      };

      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        const imagePath = path.join(process.cwd(), post.mediaUrl);
        const imageBase64 = fs.readFileSync(imagePath, "base64");
        const mime = mimeMap[ext] || "image/jpeg";

        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:${mime};base64,${imageBase64}`
          }
        });
      } else if ([".mp4", ".webm"].includes(ext)) {
        userContent.push({
          type: "text",
          text: `Media: This post contains a video file (${ext}). Please summarize based on the text context, ignoring the actual video content.`
        });
      }
    }

    messages.push({
      role: "user",
      content: userContent
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 120,
      temperature: 0.4
    });

    res.json({
      summary: completion.choices[0].message.content
    });

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

export async function getMyPosts(req, res) {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .sort({ createdAt: -1 })
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      
      // Check if user has hidden this post (user can't hide their own posts, but we check anyway)
      let isHidden = false;
      if (req.userId && post.hiddenBy) {
        isHidden = post.hiddenBy.some(id => id.toString() === req.userId);
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score,
        commentCount: post.commentCount ?? 0,
        isHidden
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

    // NEW: Exclude posts hidden by the current user
    if (req.userId) {
      query['hiddenBy'] = { $ne: req.userId };
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
      
      // Check if user has saved this post
      let isSaved = false;
      if (req.userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === req.userId);
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score,
        commentCount: post.commentCount ?? 0,
        isSaved
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

    // NEW: Exclude posts hidden by the current user
    if (req.userId) {
      query['hiddenBy'] = { $ne: req.userId };
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
      
      // Check if user has saved this post
      let isSaved = false;
      if (req.userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === req.userId);
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score,
        commentCount: post.commentCount ?? 0,
        isSaved
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

    // NEW: Exclude posts hidden by the current user
    if (req.userId) {
      query['hiddenBy'] = { $ne: req.userId };
    }

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user && v.user.toString() === req.userId);
      
      // Check if user has saved this post
      let isSaved = false;
      if (req.userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === req.userId);
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score: post.score || 0,
        commentCount: post.commentCount ?? 0,
        isSaved
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

    // NEW: Exclude posts hidden by the current user
    if (req.userId) {
      query['hiddenBy'] = { $ne: req.userId };
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
      
      // Check if user has saved this post
      let isSaved = false;
      if (req.userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === req.userId);
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score: post.score || 0,
        commentCount: post.commentCount ?? 0,
        isSaved
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

    // NEW: Exclude posts hidden by the current user
    if (req.userId) {
      query['hiddenBy'] = { $ne: req.userId };
    }

    // Use aggregation pipeline for better performance with vote count
    const posts = await Post.aggregate([
      { $match: query },
      {
        $addFields: {
          voteCount: { $size: { $ifNull: ["$votes", []] } }
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

    // Add user vote information and saved status
    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user && v.user.toString() === req.userId);
      
      // Check if user has saved this post
      let isSaved = false;
      if (req.userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === req.userId);
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score: post.score || 0,
        commentCount: post.commentCount ?? 0,
        isSaved
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

    let query = { community: { $exists: true, $ne: null } };

    // NEW: Exclude posts hidden by the current user
    if (req.userId) {
      query['hiddenBy'] = { $ne: req.userId };
    }

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .lean();

    // Calculate 24-hour score for each post
    const postsWithRecentScore = posts.map(post => {
      const recentVotes = post.votes?.filter(v => v.createdAt >= twentyFourHoursAgo) || [];
      const recentScore = recentVotes.reduce((sum, v) => sum + (v.value || 0), 0);
      
      // Check if user has saved this post
      let isSaved = false;
      if (req.userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === req.userId);
      }
      
      return { 
        ...post, 
        recentScore,
        isSaved 
      };
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

// Save a post
export async function savePost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Convert userId to string for comparison
    const userIdStr = userId.toString();
    
    // Check if already saved
    if (post.savedBy && post.savedBy.some(id => id.toString() === userIdStr)) {
      return res.status(400).json({ message: 'Post already saved' });
    }
    
    // Initialize savedBy array if it doesn't exist
    if (!post.savedBy) {
      post.savedBy = [];
    }
    
    // Add user to savedBy array
    post.savedBy.push(userId);
    post.saves = (post.saves || 0) + 1;
    await post.save();
    
   res.json({ 
  message: 'Post has been added to your saved posts',
  saves: post.saves,
  isSaved: true 
});
  } catch (err) {
    console.error("❌ Error saving post:", err);
    res.status(500).json({ message: "Failed to save post", error: err.message });
  }
}

// Unsave a post
export async function unsavePost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Convert userId to string for comparison
    const userIdStr = userId.toString();
    
    // Check if not saved
    if (!post.savedBy || !post.savedBy.some(id => id.toString() === userIdStr)) {
      return res.status(400).json({ message: 'Post not saved' });
    }
    
    // Remove user from savedBy array
    post.savedBy = post.savedBy.filter(id => id.toString() !== userIdStr);
    post.saves = Math.max(0, (post.saves || 1) - 1);
    await post.save();
    
    res.json({ 
      message: 'Post unsaved successfully',
      saves: post.saves,
      isSaved: false 
    });
  } catch (err) {
    console.error("Error unsaving post:", err);
    res.status(500).json({ message: "Failed to unsave post", error: err.message });
  }
}

export async function getSavedPosts(req, res) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const savedPosts = await Post.find({ 
      savedBy: userId 
    })
    .populate('author', 'username displayName avatarUrl')
    .populate('community', 'name title avatar _id')
    .sort({ createdAt: -1 })
    .lean();
    
    // Process posts
    const normalized = savedPosts.map(post => {
      const userVote = post.votes?.find(v => {
        return v.user && v.user.toString() === userId.toString();
      });
      
      const score = post.votes?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
      
      // Check if user has hidden this post
      let isHidden = false;
      if (userId && post.hiddenBy) {
        isHidden = post.hiddenBy.some(id => id.toString() === userId.toString());
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score,
        commentCount: post.commentCount || 0,
        isSaved: true,
        isHidden
      };
    });
    
    res.json(normalized);
    
  } catch (err) {
    console.error("❌ Error in getSavedPosts:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch saved posts",
      error: err.message 
    });
  }
}

// Hide a post
export async function hidePost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Convert userId to string for comparison
    const userIdStr = userId.toString();
    
    // Check if already hidden
    if (post.hiddenBy && post.hiddenBy.some(id => id.toString() === userIdStr)) {
      return res.status(400).json({ message: 'Post already hidden' });
    }
    
    // Initialize hiddenBy array if it doesn't exist
    if (!post.hiddenBy) {
      post.hiddenBy = [];
    }
    
    // Add user to hiddenBy array
    post.hiddenBy.push(userId);
    await post.save();
    
    res.json({ 
      message: 'Post hidden successfully',
      isHidden: true 
    });
  } catch (err) {
    console.error("❌ Error hiding post:", err);
    res.status(500).json({ message: "Failed to hide post", error: err.message });
  }
}

// Unhide a post
export async function unhidePost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Convert userId to string for comparison
    const userIdStr = userId.toString();
    
    // Check if not hidden
    if (!post.hiddenBy || !post.hiddenBy.some(id => id.toString() === userIdStr)) {
      return res.status(400).json({ message: 'Post not hidden' });
    }
    
    // Remove user from hiddenBy array
    post.hiddenBy = post.hiddenBy.filter(id => id.toString() !== userIdStr);
    await post.save();
    
    res.json({ 
      message: 'Post unhidden successfully',
      isHidden: false 
    });
  } catch (err) {
    console.error("Error unhiding post:", err);
    res.status(500).json({ message: "Failed to unhide post", error: err.message });
  }
}

// Get hidden posts for current user
export async function getHiddenPosts(req, res) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const hiddenPosts = await Post.find({ 
      hiddenBy: userId 
    })
    .populate('author', 'username displayName avatarUrl')
    .populate('community', 'name title avatar _id')
    .sort({ createdAt: -1 })
    .lean();
    
    // Process posts
    const normalized = hiddenPosts.map(post => {
      const userVote = post.votes?.find(v => {
        return v.user && v.user.toString() === userId.toString();
      });
      
      const score = post.votes?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
      
      // Check if user has saved this post
      let isSaved = false;
      if (userId && post.savedBy) {
        isSaved = post.savedBy.some(id => id.toString() === userId.toString());
      }
      
      return {
        ...post,
        userVote: userVote ? userVote.value : 0,
        score,
        commentCount: post.commentCount || 0,
        isHidden: true,
        isSaved
      };
    });
    
    res.json(normalized);
  } catch (err) {
    console.error("❌ Error in getHiddenPosts:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch hidden posts",
      error: err.message 
    });
  }
}

// GET /api/posts/:id/saved
export const getSavedStatus = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // from auth middleware

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isSaved = post.savedBy.includes(userId);
    res.json({ isSaved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch posts upvoted by the current user
export async function getUpvotedPosts(req, res) {
  try {
    const posts = await Post.find({ "votes": { $elemMatch: { user: req.userId, value: 1 } } })
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .sort({ createdAt: -1 })
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      const isSaved = post.savedBy?.some(id => id.toString() === req.userId) || false;
      const isHidden = post.hiddenBy?.some(id => id.toString() === req.userId) || false;

      return { ...post, userVote: userVote?.value || 0, score, isSaved, isHidden };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching upvoted posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Fetch posts downvoted by the current user
export async function getDownvotedPosts(req, res) {
  try {
    const posts = await Post.find({ "votes": { $elemMatch: { user: req.userId, value: -1 } } })
      .populate('author', 'username displayName avatarUrl')
      .populate('community', 'name title avatar _id')
      .sort({ createdAt: -1 })
      .lean();

    const normalized = posts.map(post => {
      const userVote = post.votes?.find(v => v.user.toString() === req.userId);
      const score = post.votes?.reduce((sum, v) => sum + v.value, 0) || 0;
      const isSaved = post.savedBy?.some(id => id.toString() === req.userId) || false;
      const isHidden = post.hiddenBy?.some(id => id.toString() === req.userId) || false;

      return { ...post, userVote: userVote?.value || 0, score, isSaved, isHidden };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching downvoted posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ author: userId })
                            .sort({ createdAt: -1 })
                            .populate('community')
                            .populate('author', 'username avatarUrl');
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts for this user' });
  }
};


export const getSavedPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const posts = await Post.find({ savedBy: userId })
      .sort({ createdAt: -1 })
      .populate("author", "username avatarUrl")
      .populate("community", "name avatar")
      .lean();

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching saved posts by user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getHiddenPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const posts = await Post.find({ hiddenBy: userId })
      .sort({ createdAt: -1 })
      .populate("author", "username avatarUrl")
      .populate("community", "name avatar")
      .lean();

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching hidden posts by user:", err);
    res.status(500).json({ message: "Server error" });
  }
};