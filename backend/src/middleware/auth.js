import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authMiddleware(req, res, next) {
  const token = req.cookies?.token; // only from cookies
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = payload.id;
    req.user = await User.findById(payload.id).select('-passwordHash');
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
