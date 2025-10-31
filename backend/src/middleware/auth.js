import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function authMiddleware(req,res,next){
  console.log(req.cookies.token);
  const auth = req.headers.authorization || req.cookies.token;
  if(!auth) return res.status(401).json({message:'No token'});
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = payload.id;
    req.user = await User.findById(payload.id).select('-passwordHash');
    next();
  }catch(e){
    return res.status(401).json({message:'Invalid token'});
  }
}
