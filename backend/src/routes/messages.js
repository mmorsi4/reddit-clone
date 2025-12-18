import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
<<<<<<< HEAD
import { getMessages } from '../controllers/messages.js';
const router = express.Router();

router.get('/', authMiddleware, getMessages);
=======
import { getMessages , sendFeedMessage } from '../controllers/messages.js';
const router = express.Router();

router.get('/', authMiddleware, getMessages);
router.post("/share-feed", authMiddleware, sendFeedMessage);

>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
export default router;