import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getProfile, me, getProfileByUsername, getRecentCommunities, updateRecentCommunities } from '../controllers/users.js';
const router = express.Router();

router.get('/recent-communities', authMiddleware, getRecentCommunities);
router.get('/me', authMiddleware, me);
router.get('/id/:id', getProfile);
router.get('/:username', getProfileByUsername); // must be the last placed route
router.post('/recent-communities', authMiddleware, updateRecentCommunities);

export default router;
