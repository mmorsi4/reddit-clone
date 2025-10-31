import Community from '../models/Community.js';

export async function createCommunity(req,res){
  const { name, title, description } = req.body;
  const exists = await Community.findOne({ name });
  if(exists) return res.status(409).json({message:'Community exists'});
  const c = await Community.create({ name, title, description, members: [req.userId]});
  res.status(201).json(c);
}
export async function listCommunities(req,res){
  const cs = await Community.find().limit(50);
  res.json(cs);
}
