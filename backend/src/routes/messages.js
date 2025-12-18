import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getMessages , sendFeedMessage } from '../controllers/messages.js';
const router = express.Router();

router.get('/', authMiddleware, getMessages);
router.post("/share-feed", authMiddleware, sendFeedMessage);

export default router;