import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

// GET /api/popular
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .populate("community", "name avatar")
      .sort({ createdAt: -1 });

    // Add popularity score using score (net votes) and commentCount
    const ranked = posts.map(post => {
      const postObject = post.toObject();
      return {
        ...postObject,
        popularityScore: postObject.score + (postObject.commentCount * 2)
      };
    });

    // Sort by popularity - FIXED TYPO: was "b.poppopularityScore"
    ranked.sort((a, b) => b.popularityScore - a.popularityScore);

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;