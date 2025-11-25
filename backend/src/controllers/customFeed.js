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

export async function updateCustomFeedMetadata(req, res) {
  try {
    const { feedName } = req.params;
    const { name, description, isPrivate, showOnProfile } = req.body;
    
    // Validation
    if (!name) {
        return res.status(400).json({ message: "Feed name is required." });
    }

    // 1. Find the feed and check authorization
    // NOTE: We find by the current (old) feedName to ensure we get the correct document, 
    // and check if the current user is the author.
    let feed = await CustomFeed.findOne({ 
        name: feedName, 
        author: req.userId 
    });

    if (!feed) {
        return res.status(404).json({ message: "Custom Feed not found or unauthorized access." });
    }

    // 2. Check for duplicate name if the name is being changed
    if (name !== feed.name) {
        const existingFeed = await CustomFeed.findOne({ name: name });
        if (existingFeed) {
            return res.status(409).json({ message: "A custom feed with this new name already exists." });
        }
    }
    
    // 3. Update fields
    feed.name = name;
    feed.description = description || ''; // Handle empty description
    feed.isPrivate = isPrivate;
    feed.showOnProfile = showOnProfile;

    await feed.save();

    // Re-fetch with populated author details to match the format expected by the frontend (getCustomFeedByName)
    const updatedFeed = await CustomFeed.findById(feed._id)
      .populate('author', 'username avatarUrl') 
      .select('-__v'); 

    // 4. Success Response
    return res.status(200).json(updatedFeed);

  } catch (error) {
    console.error("Error updating custom feed metadata:", error);
    return res.status(500).json({ 
        message: "Internal server error during feed metadata update.",
        details: error.message 
    });
  }
}
// --- END NEW FUNCTION ---

// --- RENAMED FUNCTION: Update Community List ---
export async function updateCustomFeedCommunitiesList(req, res) { // Renamed from updateCustomFeedCommunities
    try {
        const { feedName } = req.params;
        const { communities: communityIds } = req.body; 

        // 1. Find feed and check authorization
        const feed = await CustomFeed.findOne({ 
            name: feedName, 
            author: req.userId
        });

        if (!feed) {
            return res.status(404).json({ message: "Custom Feed not found or unauthorized access." });
        }

        // 2. Update the communities array
        feed.communities = communityIds;
        await feed.save();

        // 3. Re-fetch with populated author details to match the format expected by the frontend
        const updatedFeed = await CustomFeed.findById(feed._id)
          .populate('author', 'username avatarUrl') 
          .select('-__v'); 

        // 4. Success Response
        return res.status(200).json(updatedFeed);

    } catch (error) {
        console.error("Error updating custom feed communities:", error);
        return res.status(500).json({ 
            message: "Internal server error during feed community update.",
            details: error.message 
        });
    }
}