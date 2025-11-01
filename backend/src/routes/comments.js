import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createComment } from '../controllers/comments.js';
import { getMyComments } from '../controllers/comments.js';
const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/my', authMiddleware, getMyComments); 

export default router;
