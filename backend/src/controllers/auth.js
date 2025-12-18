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

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,   // works on HTTP and HTTPS
    sameSite: 'lax', // allows sending cookies for same-site requests
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({user:{id:user._id,username:user.username,email:user.email}, token});
}

export async function resetPassword(req, res) {
  try {
    const { usernameOrEmail, newPassword } = req.body;

    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}



export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      authenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    res.status(200).json({ authenticated: false });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    // Also clear Authorization header if client stores it there
    res.set('Authorization', '');
    
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
};