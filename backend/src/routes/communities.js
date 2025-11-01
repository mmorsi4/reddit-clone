import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createCommunity, listCommunities, listJoinedCommunities } from '../controllers/communities.js';
const router = express.Router();

router.get('/', listCommunities); // all communities
router.get('/joined', authMiddleware, listJoinedCommunities); // only joined
router.post('/', authMiddleware, createCommunity);


export default router;