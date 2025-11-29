import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getProfile, me, getUsers, getProfileByUsername, getRecentCommunities, updateRecentCommunities, updateAvatar } from '../controllers/users.js';
const router = express.Router();

router.get('/recent-communities', authMiddleware, getRecentCommunities);
router.get('/me', authMiddleware, me);
router.get('/', getUsers); // must be the last placed route
router.get('/id/:id', getProfile);
router.post('/update-avatar', authMiddleware, updateAvatar);
router.get('/:username', getProfileByUsername); // must be the last placed route
router.post('/recent-communities', authMiddleware, updateRecentCommunities);

export default router;
