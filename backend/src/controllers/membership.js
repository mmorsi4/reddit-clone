import Membership from "../models/Membership.js";
import Community from "../models/Community.js";
import mongoose from "mongoose";

// ✅ Join community
export async function joinCommunity(req, res) {
  try {
    const { communityId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid communityId" });
    }

    const userId = req.user._id; // make sure req.user is set in auth middleware

    // Check if membership already exists
    const existing = await Membership.findOne({ communityId, userId });
    if (existing) return res.status(409).json({ message: "Already a member" });

    // Create membership
    const membership = await Membership.create({
      communityId,
      userId,
      role: "member",
    });

    // Optionally increment member count in Community
    await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: 1 } });

    return res.status(201).json({ message: "Joined community", membership });
  } catch (err) {
    console.error("Error joining community:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ✅ Leave community
export async function unjoinCommunity(req, res) {
  try {
    const { communityId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid communityId" });
    }

    const userId = req.user._id;

    const deleted = await Membership.findOneAndDelete({ communityId, userId });

    if (!deleted) return res.status(404).json({ message: "Membership not found" });

    await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: -1 } });

    return res.status(200).json({ message: "Left community" });
  } catch (err) {
    console.error("Error unjoining community:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ✅ Check membership
export const checkMembership = async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.query.communityId;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid communityId" });
    }

    const membership = await Membership.findOne({ userId, communityId });

    res.json({ isMember: !!membership });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};