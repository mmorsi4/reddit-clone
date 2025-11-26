import Membership from "../models/Membership.js";
import Community from "../models/Community.js";

export async function createCommunity(req, res) {
  try {
    const { name, title, description, avatar, banner, topics } = req.body;

    const exists = await Community.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Community already exists" });
    }

    const community = await Community.create({
      name,
      title: title || name,
      description,
      avatar: avatar || "",
      banner: banner || "",
      topics: topics || [],
      createdBy: req.userId,
    });

    return res.status(201).json(community);
  } catch (error) {
    console.error("Error creating community:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export async function listCommunities(req, res) {
  try {
    const communities = await Community.find().lean(); // returns array
    res.status(200).json(communities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

export async function listCommunitiesWithFavorites(req, res) {
  try {
    const memberships = await Membership.find({ userId: req.userId }).populate("communityId").lean();
    const joinedWithFavorites = memberships.map(m => ({
      ...m.communityId,         
      joined: true,            
      favorite: m.favorite || false
    }));

    res.status(200).json(joinedWithFavorites);
  } catch (err) {
    console.error("Error listing joined communities with favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function listCommunitiesByTopic(req, res) {
  try {
    const { topic } = req.query;
    let communities;

    if (topic && topic !== 'All') {
      communities = await Community.find({ topics: topic }).lean();
    } else {
      communities = await Community.find().lean();
    }


    res.status(200).json(communities);
  } catch (err) {
    console.error("Error listing communities by topic:", err);
    res.status(500).json({ message: "Server error" });
  }
}