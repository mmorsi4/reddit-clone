import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getProfile, me, getProfileByUsername } from '../controllers/users.js';
const router = express.Router();

router.get('/me', authMiddleware, me);
router.get('/id/:id', getProfile);
router.get('/:username', getProfileByUsername);

export default router;
