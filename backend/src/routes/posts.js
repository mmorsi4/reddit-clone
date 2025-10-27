import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createPost, getPosts, getPost, votePost } from '../controllers/posts.js';
const router = express.Router();

router.get('/', getPosts);
router.post('/', authMiddleware, createPost);
router.get('/:id', getPost);
router.post('/:id/vote', authMiddleware, votePost);

export default router;
