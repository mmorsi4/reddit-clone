import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createComment, getMyComments, voteComment } from '../controllers/comments.js';

const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/my', authMiddleware, getMyComments); 
router.post('/:id/vote', authMiddleware, voteComment);

export default router;