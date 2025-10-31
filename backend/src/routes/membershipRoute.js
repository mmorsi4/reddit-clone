import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { joinCommunity, unjoinCommunity ,checkMembership  } from "../controllers/membership.js";

const router = express.Router();

router.post("/join", authMiddleware, joinCommunity);
router.post("/unjoin", authMiddleware, unjoinCommunity);
router.get("/check", authMiddleware, checkMembership);


export default router;