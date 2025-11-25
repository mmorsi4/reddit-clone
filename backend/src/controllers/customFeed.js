import CustomFeed from '../models/CustomFeed.js';

export async function createCustomFeed(req, res) {
  try {
    const { name, description, isPrivate, showOnProfile, image } = req.body;
    
    if (!name || !image) {
      return res.status(400).json({ message: "Name and image path are required." });
    }

    const feed = await CustomFeed.create({
      name,
      description,
      isPrivate,
      showOnProfile,
      image,
      author: req.userId, 
      communities: [], 
    });

    res.status(201).json(feed);
  } catch (err) {
    if (err.code === 11000) { 
        return res.status(409).json({ message: "A custom feed with this name already exists." });
    }
    console.error("Error creating custom feed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyCustomFeeds(req, res) {
  try {
    // Fetch all custom feeds created by the current user
    const feeds = await CustomFeed.find({ author: req.userId }).sort({ createdAt: 1 });

    res.json(feeds);
  } catch (err) {
    console.error("Error fetching custom feeds:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCustomFeedByName(req, res) {
  try {
    const { feedName } = req.params;

    const feed = await CustomFeed.findOne({ name: feedName })
      .populate('author', 'username avatarUrl') 
      .select('-__v'); 

    if (!feed) {
      return res.status(404).json({ message: "Custom Feed not found." });
    }
    
    if (feed.isPrivate && feed.author._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied. This feed is private." });
    }

    res.json(feed);
  } catch (err) {
    console.error("Error fetching custom feed by name:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateCustomFeedCommunities(req, res) {
    try {
        const { feedName } = req.params;
        const { communities: communityIds } = req.body; 

        // 🌟 FIX: Use 'author' instead of 'createdBy' to match the model 🌟
        const feed = await CustomFeed.findOne({ 
            name: feedName, 
            author: req.userId // Changed from createdBy: req.userId
        });

        if (!feed) {
            // This error is now likely accurate: the user doesn't own this feed, or it doesn't exist.
            return res.status(404).json({ message: "Custom Feed not found or unauthorized access." });
        }

        // 2. Update the communities array
        feed.communities = communityIds;
        await feed.save();

        // 3. Success Response
        return res.status(200).json({ 
            message: `Communities for feed '${feedName}' updated successfully.`,
            feed: feed 
        });

    } catch (error) {
        console.error("Error updating custom feed communities:", error);
        return res.status(500).json({ 
            message: "Internal server error during feed update.",
            details: error.message 
        });
    }
}