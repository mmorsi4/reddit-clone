import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export async function createComment(req,res){
  const { postId, parent, body } = req.body;
  const post = await Post.findById(postId);
  if(!post) return res.status(404).json({message:'Post not found'});
  const comment = await Comment.create({ post: postId, parent: parent || null, author: req.userId, body });
  post.commentCount = (post.commentCount || 0) + 1;
  await post.save();
  res.status(201).json(comment);
}
