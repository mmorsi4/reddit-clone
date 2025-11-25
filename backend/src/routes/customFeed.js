import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
    createCustomFeed, 
    getMyCustomFeeds,
    getCustomFeedByName,
    updateCustomFeedMetadata,
    updateCustomFeedCommunitiesList 
} from '../controllers/customFeed.js';

const router = express.Router();

router.post('/', authMiddleware, createCustomFeed);
router.get('/', authMiddleware, getMyCustomFeeds);
router.get('/name/:feedName', authMiddleware, getCustomFeedByName); 
router.put('/name/:feedName', authMiddleware, updateCustomFeedMetadata);
router.put('/name/:feedName/communities', authMiddleware, updateCustomFeedCommunitiesList);
export default router;