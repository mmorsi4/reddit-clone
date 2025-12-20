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
    getPostSummary,
    savePost,    
    unsavePost,      
    getSavedPosts,
    hidePost,
    unhidePost,
    getHiddenPosts ,
    getSavedStatus,
    getUpvotedPosts,
    getDownvotedPosts
} from '../controllers/posts.js';

const router = express.Router();

// 🚨 IMPORTANT: Specific routes MUST come before dynamic routes!

// 1. GET routes (specific to general)
router.get('/best', authMiddleware, getHomeBestPosts);
router.get('/new', authMiddleware, getHomeNewPosts);
router.get('/top', authMiddleware, getHomeTopPosts);
router.get('/all-feed', authMiddleware, getAllFeedPosts); 
router.get('/my/posts', authMiddleware, getMyPosts);
router.get('/popular', authMiddleware, getPopularPosts);
router.get('/saved', authMiddleware, getSavedPosts);
router.get('/hidden', authMiddleware, getHiddenPosts); // ✅ Only one /hidden route
router.get('/', authMiddleware, getPosts);

// 2. POST routes
router.post('/', authMiddleware, upload.single('file'), createPost);
router.post('/custom-feed-posts', authMiddleware, getCustomFeedPosts);

// 3. Dynamic routes with :id
router.post('/:id/save', authMiddleware, savePost);
router.post('/:id/unsave', authMiddleware, unsavePost);
router.post('/:id/hide', authMiddleware, hidePost);
router.post('/:id/unhide', authMiddleware, unhidePost);
router.post('/:id/vote', authMiddleware, votePost);
router.get('/:id/summary', authMiddleware, getPostSummary);
router.get('/:id/saved', authMiddleware, getSavedStatus);
router.get("/upvoted", getUpvotedPosts);
router.get("/downvoted", getDownvotedPosts);
router.get('/:id', authMiddleware, getPost); // ⚠️ MUST BE LAST!


export default router;