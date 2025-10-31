import User from '../models/User.js';

export async function getProfile(req,res){
  const user = await User.findById(req.params.id).select('-passwordHash');
  if(!user) return res.status(404).json({message:'Not found'});
  res.json(user);
}

export async function me(req,res){
  const user = await User.findById(req.userId).select('-passwordHash');
  res.json(user);
}