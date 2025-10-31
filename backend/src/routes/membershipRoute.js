import express from "express";
import { Membership, Community, User } from "../model/models.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Join community
router.post("/join", authMiddleware, async (req, res) => {
    try {
        const { communityId } = req.body;
        const userId = req.userId;

        // Check if already joined
        const existing = await Membership.findOne({ communityId, userId });
        if (existing) {
            return res.status(400).json({ message: "Already joined" });
        }

        await Membership.create({ communityId, userId });
        await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: 1 } });

        res.json({ message: "Joined community successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to join community" });
    }
});

// Unjoin community
router.post("/unjoin", authMiddleware, async (req, res) => {
    try {
        const { communityId } = req.body;
        const userId = req.user.id;

        const membership = await Membership.findOneAndDelete({ communityId, userId });
        if (!membership) {
            return res.status(400).json({ message: "Not a member" });
        }

        await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: -1 } });

        res.json({ message: "Unjoined community successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to unjoin community" });
    }
});

// Get all joined communities by user
router.get("/joined", authMiddleware, async (req, res) => {
    try {
        const memberships = await Membership.find({ userId: req.user.id }).populate("communityId");
        const communities = memberships.map(m => ({
            _id: m.communityId._id,
            name: m.communityId.slug,
            title: m.communityId.title,
            iconUrl: m.communityId.iconUrl
        }));
        res.json(communities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch joined communities" });
    }
});

export default router;
