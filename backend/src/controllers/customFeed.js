import CustomFeed from '../models/CustomFeed.js';


export async function createCustomFeed(req, res) {
  try {
    // ✅ Destructure initialCommunityId from the request body
    const { 
      name, 
      description, 
      isPrivate, 
      showOnProfile, 
      image, 
      initialCommunityId 
    } = req.body;

    if (!name || !image) {
      return res.status(400).json({ message: "Name and image path are required." });
    }
    
    // ✅ Check if initialCommunityId is provided and use it, otherwise use an empty array
    const communitiesList = initialCommunityId ? [initialCommunityId] : [];

    const feed = await CustomFeed.create({
      name,
      description,
      isPrivate,
      showOnProfile,
      image,
      author: req.userId,
      // ✅ Use the dynamically created list
      communities: communitiesList, 
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
    const feeds = await CustomFeed.find({ author: req.userId }).sort({ createdAt: 1 });
    res.json(feeds);
  } catch (err) {
    console.error("Error fetching custom feeds:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function getCustomFeedById(req, res) {
  try {
    const { feedId } = req.params;

    const feed = await CustomFeed.findById(feedId)
      .populate('author', 'username avatarUrl')
      .populate('communities', 'name avatar');

    if (!feed) return res.status(404).json({ message: "Custom feed not found." });

    if (feed.isPrivate && feed.author._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied. This feed is private." });
    }

    res.json(feed);
  } catch (err) {
    console.error("Error fetching custom feed by ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function updateCustomFeedMetadata(req, res) {
  try {
    const { feedId } = req.params;
    const { name, description, isPrivate, showOnProfile, image } = req.body; 

    if (!name) {
      return res.status(400).json({ message: "Feed name is required." });
    }

    const feed = await CustomFeed.findById(feedId);
    if (!feed || feed.author.toString() !== req.userId) {
      return res.status(404).json({ message: "Feed not found or unauthorized." });
    }

    if (name !== feed.name) {
      const existingFeed = await CustomFeed.findOne({ name });
      if (existingFeed) {
        return res.status(409).json({ message: "A custom feed with this new name already exists." });
      }
    }

    feed.name = name;
    feed.description = description || '';
    feed.isPrivate = isPrivate;
    feed.showOnProfile = showOnProfile;
    
    if (image) { 
        feed.image = image;
    }

    await feed.save();

    const updatedFeed = await CustomFeed.findById(feed._id)
      .populate('author', 'username avatarUrl')
      .populate('communities', 'name avatar')
      .select('-__v');

    res.status(200).json(updatedFeed);
  } catch (err) {
    console.error("Error updating feed metadata:", err);
    res.status(500).json({ message: "Internal server error", details: err.message });
  }
}

export async function updateCustomFeedCommunities(req, res) {
  try {
    const { feedId } = req.params;
    const { communities } = req.body;

    if (!Array.isArray(communities)) {
      return res.status(400).json({ message: "Communities list must be an array." });
    }

    const feed = await CustomFeed.findById(feedId);
    if (!feed || feed.author.toString() !== req.userId) {
      return res.status(404).json({ message: "Feed not found or unauthorized." });
    }

    feed.communities = communities;
    await feed.save();

    const populatedFeed = await CustomFeed.findById(feed._id)
      .populate('author', 'username avatarUrl')
      .populate('communities', 'name avatar')
      .select('-__v');

    res.status(200).json(populatedFeed);
  } catch (err) {
    console.error("Error updating communities:", err);
    res.status(500).json({ message: "Server error while updating communities." });
  }
}


export async function updateCustomFeedCommunitiesList(req, res) { 
    try {
        const { feedName } = req.params;
        const { communities: communityIds } = req.body; 

        const feed = await CustomFeed.findOne({ 
            name: feedName, 
            author: req.userId
        });

        if (!feed) {
            return res.status(404).json({ message: "Custom Feed not found or unauthorized access." });
        }

        feed.communities = communityIds;
        await feed.save();

        const updatedFeed = await CustomFeed.findById(feed._id)
          .populate('author', 'username avatarUrl') 
          .select('-__v'); 

        return res.status(200).json(updatedFeed);

    } catch (error) {
        console.error("Error updating custom feed communities:", error);
        return res.status(500).json({ 
            message: "Internal server error during feed community update.",
            details: error.message 
        });
    }
}

export async function deleteCustomFeed(req, res) {
  try {
    const { feedId } = req.params;

    const feed = await CustomFeed.findById(feedId);

    // Check if feed exists and the user is the author
    if (!feed || feed.author.toString() !== req.userId) {
      return res.status(404).json({ message: "Feed not found or unauthorized to delete." });
    }

    // Delete the feed
    await CustomFeed.findByIdAndDelete(feedId);

    res.status(200).json({ message: "Custom feed deleted successfully." });
  } catch (err) {
    console.error("Error deleting custom feed:", err);
    res.status(500).json({ message: "Internal server error during deletion." });
  }
}

export async function copyCustomFeed(req, res) {
  try {
    const { feedId } = req.params;

    const originalFeed = await CustomFeed.findById(feedId);

    if (!originalFeed) {
      return res.status(404).json({ message: "Original feed not found." });
    }

    let newName = `${originalFeed.name} (Copy)`;
    let counter = 1;
    while (await CustomFeed.findOne({ name: newName })) {
      counter++;
      newName = `${originalFeed.name} (Copy ${counter})`;
    }

    const newFeed = await CustomFeed.create({
      name: newName,
      description: originalFeed.description,
      isPrivate: true, 
      showOnProfile: originalFeed.showOnProfile,
      image: originalFeed.image,
      author: req.userId, 
      communities: originalFeed.communities,
    });

    res.status(201).json(newFeed);
  } catch (err) {
    console.error("Error copying custom feed:", err);
    res.status(500).json({ message: "Internal server error during copy." });
  }
}