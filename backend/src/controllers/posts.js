import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

export async function createPost(req,res){
  const { title, body, url, community } = req.body;
  const file = req.file;
  const post = await Post.create({ title, body, url, community, author: req.userId, mediaUrl: file ? `/uploads/${file.filename}` : null, });
  res.status(201).json(post);
}

export async function getPosts(req,res){
  const { community, limit=20, page=1, sort='hot' } = req.query;
  const q = community ? { community } : {};
  const posts = await Post.find(q)
    .populate('author','username displayName avatarUrl')
    .populate('community','name title')
    .sort({ createdAt: -1 })
    .skip((page-1)*limit).limit(Number(limit));
  res.json(posts);
}

export async function getPost(req,res){
  const post = await Post.findById(req.params.id).populate('author','username displayName');
  if(!post) return res.status(404).json({message:'Not found'});
  const comments = await Comment.find({ post: post._id }).populate('author','username displayName');
  res.json({ post, comments });
}

export async function votePost(req,res){
  const { value } = req.body; // 1 or -1
  if (![1,-1].includes(value)) return res.status(400).json({message:'Invalid vote'});
  const post = await Post.findById(req.params.id);
  if(!post) return res.status(404).json({message:'Not found'});
  post.votes = post.votes.filter(v=>v.user.toString()!==req.userId);
  post.votes.push({user: req.userId, value});
  await post.save();
  res.json({score: post.votes.reduce((s,v)=>s+v.value,0)});
}
