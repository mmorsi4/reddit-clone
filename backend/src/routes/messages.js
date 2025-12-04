import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getMessages } from '../controllers/messages.js';
const router = express.Router();

router.get('/', authMiddleware, getMessages);
export default router;