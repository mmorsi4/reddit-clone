import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
  createCommunity, 
  listCommunities, 
  listJoinedCommunities, 
  listCommunitiesWithFavorites,
  listCommunitiesByTopic
} from '../controllers/communities.js';
const router = express.Router();

router.get('/', listCommunities); 
router.get('/filter', listCommunitiesByTopic); 
router.get('/joined', authMiddleware, listJoinedCommunities); 
router.post('/', authMiddleware, createCommunity);
router.get('/with-favorites', authMiddleware, listCommunitiesWithFavorites);

export default router;