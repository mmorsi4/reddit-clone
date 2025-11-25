import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createCustomFeed, getMyCustomFeeds } from '../controllers/customFeed.js';

const router = express.Router();

router.post('/', authMiddleware, createCustomFeed);
router.get('/', authMiddleware, getMyCustomFeeds);

export default router;