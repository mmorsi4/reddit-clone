import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { joinCommunity, unjoinCommunity, checkMembership, toggleFavorite } from "../controllers/membership.js";

const router = express.Router();

router.post("/join", authMiddleware, joinCommunity);
router.post("/unjoin", authMiddleware, unjoinCommunity);
router.get("/check", authMiddleware, checkMembership);
router.post("/favorite/:communityId", authMiddleware, toggleFavorite);

export default router;