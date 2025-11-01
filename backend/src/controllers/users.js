import User from '../models/User.js';

export async function getProfile(req,res){
  const user = await User.findById(req.params.id).select('-passwordHash');
  if(!user) return res.status(404).json({message:'Not found'});
  res.json(user);
}

export async function getProfileByUsername(req, res) {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function me(req,res){
  const user = await User.findById(req.userId).select('-passwordHash');
  res.json(user);
}