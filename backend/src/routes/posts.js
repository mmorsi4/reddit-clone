import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import { 
    createPost, 
    getPosts, 
    getPost, 
    votePost,
    getMyPosts,
    getAllFeedPosts,
    getCustomFeedPosts,
    getHomeBestPosts,
    getHomeNewPosts,
    getHomeTopPosts,
    getPopularPosts,
    getPostSummary
} from '../controllers/posts.js';

const router = express.Router();

router.get('/best', authMiddleware, getHomeBestPosts);
router.get('/new', authMiddleware, getHomeNewPosts);
router.get('/top', authMiddleware, getHomeTopPosts);
router.get('/all-feed', authMiddleware, getAllFeedPosts); 
router.get('/my/posts', authMiddleware, getMyPosts);
router.get('/popular', authMiddleware, getPopularPosts);
router.get('/', authMiddleware, getPosts);
router.post('/', authMiddleware, upload.single('file'), createPost);
router.get('/:id', authMiddleware, getPost); 
router.get('/:id/summary', authMiddleware, getPostSummary)
router.post('/:id/vote', authMiddleware, votePost);
router.post('/custom-feed-posts', authMiddleware, getCustomFeedPosts);

export default router;0