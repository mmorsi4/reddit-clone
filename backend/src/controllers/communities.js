import Membership from "../models/Membership.js";
import Community from "../models/Community.js";

// Create a new community
export async function createCommunity(req, res) {
  try {
    const { name, title, description, avatar, banner, type, topics } = req.body;

    // Check if the community already exists
    const exists = await Community.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Community already exists" });
    }

    // Create the new community with avatar and banner
    const community = await Community.create({
      name,
      title,
      description,
      avatar: avatar || "", // save Base64 string or default empty
      banner: banner || "",
      type: type || "public",
      topics: topics || [],
      members: [req.userId],
    });

    return res.status(201).json(community);
  } catch (error) {
    console.error("Error creating community:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// List communities
export async function listCommunities(req, res) {
  try {
    const communities = await Community.find().limit(50);
    return res.status(200).json(communities);
  } catch (error) {
    console.error("Error listing communities:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function listJoinedCommunities(req, res) {
  try {
    const memberships = await Membership.find({ userId: req.userId }).populate("communityId");
    const joinedCommunities = memberships.map(m => m.communityId);
    return res.status(200).json(joinedCommunities);
  } catch (error) {
    console.error("Error listing joined communities:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

