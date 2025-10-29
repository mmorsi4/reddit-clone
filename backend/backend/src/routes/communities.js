import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createCommunity, listCommunities } from '../controllers/communities.js';
const router = express.Router();

router.get('/', listCommunities);
router.post('/', authMiddleware, createCommunity);

export default router;
