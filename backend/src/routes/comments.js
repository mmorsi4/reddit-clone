import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createComment } from '../controllers/comments.js';
const router = express.Router();

router.post('/', authMiddleware, createComment);

export default router;
