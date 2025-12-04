import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createComment, getMyComments, voteComment, getCommentReplies } from '../controllers/comments.js';import Comment from '../models/Comment.js';

const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/my', authMiddleware, getMyComments); 
router.post('/:id/vote', authMiddleware, voteComment);
router.get('/:id/replies', authMiddleware, getCommentReplies);

export default router;