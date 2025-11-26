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
    getHomeTopPosts
} from '../controllers/posts.js';

const router = express.Router();

router.get('/best', getHomeBestPosts);
router.get('/new', getHomeNewPosts);
router.get('/top', getHomeTopPosts);
router.get('/all-feed', getAllFeedPosts); 
router.get('/my/posts', authMiddleware, getMyPosts); 
router.get('/', getPosts);
router.post('/', authMiddleware, upload.single('file'), createPost);
router.get('/:id', getPost); 
router.post('/:id/vote', authMiddleware, votePost);
router.post('/custom-feed-posts', authMiddleware, getCustomFeedPosts);




export default router;