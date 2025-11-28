import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Create a comment and increment commentCount
export async function createComment(req, res) {
  try {
    const { post, parent, body } = req.body;
    const postDoc = await Post.findById(post);
    if (!postDoc) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post,
      parent: parent || null,
      author: req.userId,
      body,
    });

    // increment commentCount safely
    await Post.findByIdAndUpdate(post, { $inc: { commentCount: 1 } });

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Failed to create comment' });
  }
}

// Delete a comment and decrement commentCount
export async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await comment.deleteOne();

    // decrement commentCount safely
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}

// Fetch user's comments
export async function getMyComments(req, res) {
  try {
    const comments = await Comment.find({ author: req.userId })
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
}

export async function voteComment(req, res) {
  try {
    const { value } = req.body;
    if (![1, -1, 0].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    // Initialize votes array if it doesn't exist
    comment.votes = comment.votes || [];
    
    // Remove existing vote from this user
    comment.votes = comment.votes.filter(v => v.user.toString() !== req.userId);
    
    // Add new vote if value is not 0
    if (value !== 0) {
      comment.votes.push({ user: req.userId, value });
    }
    await comment.save();
    
    // Verify the save worked
    const updatedComment = await Comment.findById(req.params.id);
    // Calculate total score
    const score = updatedComment.votes.reduce((total, vote) => total + vote.value, 0);
    res.json({ 
      score,
      userVote: value 
    });
    
  } catch (err) {
    console.error("Error voting on comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}