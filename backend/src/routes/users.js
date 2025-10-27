import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getProfile, me } from '../controllers/users.js';
const router = express.Router();

router.get('/me', authMiddleware, me);
router.get('/:id', getProfile);

export default router;
