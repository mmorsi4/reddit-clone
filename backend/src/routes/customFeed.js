import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
    createCustomFeed, 
    getMyCustomFeeds,
    getCustomFeedById,
    updateCustomFeedMetadata,
    updateCustomFeedCommunitiesList,
    updateCustomFeedCommunities,
    deleteCustomFeed,
    copyCustomFeed
} from '../controllers/customFeed.js';

const router = express.Router();

router.post('/', authMiddleware, createCustomFeed);
router.get('/', authMiddleware, getMyCustomFeeds);
router.get('/:feedId', authMiddleware, getCustomFeedById);
router.put("/:feedId/communities", authMiddleware, updateCustomFeedCommunities);
router.put('/name/:feedId', authMiddleware, updateCustomFeedMetadata);
router.put('/name/:feedId/communities', authMiddleware, updateCustomFeedCommunitiesList);
router.delete('/:feedId', authMiddleware, deleteCustomFeed);
router.post('/copy/:feedId', authMiddleware, copyCustomFeed);

export default router;