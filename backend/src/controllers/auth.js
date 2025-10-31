import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_EXPIRES = '7d';

export async function signup(req,res){
  const { username, email, password } = req.body;
  const exists = await User.findOne({ $or: [{username},{email}] });
  if(exists) return res.status(409).json({message:'User already exists'});
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash });
  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET || 'secret', {expiresIn: JWT_EXPIRES});
  res.status(201).json({user:{id:user._id,username:user.username,email:user.email}, token});
}

export async function login(req,res){
  const { usernameOrEmail, password } = req.body;
  const user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]} );
  if(!user) return res.status(401).json({message:'Invalid username or email'});
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(401).json({message:'Invalid password'});
  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET || 'secret', {expiresIn: JWT_EXPIRES});
  res.json({user:{id:user._id,username:user.username,email:user.email}, token});
}
