import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
    createCustomFeed, 
    getMyCustomFeeds,
    getCustomFeedByName,
    updateCustomFeedCommunities
} from '../controllers/customFeed.js';

const router = express.Router();

router.post('/', authMiddleware, createCustomFeed);
router.get('/', authMiddleware, getMyCustomFeeds);
router.get('/name/:feedName', authMiddleware, getCustomFeedByName); 
router.put('/name/:feedName', authMiddleware, updateCustomFeedCommunities);

export default router;