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
    res.status(200).json({
      isMember: !!membership,
      isFavorite: membership ? membership.favorite : false 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export async function toggleFavorite(req, res) {
  try {
    const userId = req.user._id;
    const { communityId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid communityId" });
    }

    // Find membership
    const membership = await Membership.findOne({ userId, communityId });
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    // Toggle favorite flag
    membership.favorite = !membership.favorite;
    await membership.save();

    res.json({ favorite: membership.favorite });
  } catch (err) {
    console.error("Error toggling favorite:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// get joined communities
export const getJoinedCommunities = async (req, res) => {
  try {
    const userId = req.user._id;
    const memberships = await Membership.find({ userId })
      .populate('communityId')
      .exec();

    const joinedCommunities = memberships.map(membership => ({
      _id: membership.communityId._id,
      name: membership.communityId.name,
      description: membership.communityId.description,
      avatar: membership.communityId.avatar,
      banner: membership.communityId.banner,
      membersCount: membership.communityId.membersCount,
      createdAt: membership.communityId.createdAt,
      favorite: membership.favorite,
      role: membership.role,
      joinedAt: membership.joinedAt
    }));

    res.status(200).json(joinedCommunities);
  } catch (err) {
    console.error("Error fetching joined communities:", err);
    res.status(500).json({ message: "Server error" });
  }
};