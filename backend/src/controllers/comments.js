import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export async function createComment(req,res){
  const { post, parent, body } = req.body; // ← CHANGE: postId → post
  const postDoc = await Post.findById(post); // ← CHANGE: postId → post
  if(!postDoc) return res.status(404).json({message:'Post not found'});
  const comment = await Comment.create({ post, parent: parent || null, author: req.userId, body }); // ← CHANGE: postId → post
  postDoc.commentCount = (postDoc.commentCount || 0) + 1;
  await postDoc.save();
  res.status(201).json(comment);
}

export async function getMyComments(req, res) {
  try {
    const comments = await Comment.find({ author: req.userId })
      .populate('post', 'title') // Get post title
      .sort({ createdAt: -1 }); // Newest first
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
}