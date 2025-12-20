import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createComment, getMyComments, voteComment, getCommentReplies, getUserComments} from '../controllers/comments.js';import Comment from '../models/Comment.js';

const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/my', authMiddleware, getMyComments); 
router.post('/:id/vote', authMiddleware, voteComment);
router.get('/:id/replies', authMiddleware, getCommentReplies);
router.get('/user/:userId', authMiddleware, getUserComments);


export default router;