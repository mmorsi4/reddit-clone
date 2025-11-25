import CustomFeed from '../models/CustomFeed.js';


export async function createCustomFeed(req, res) {
  try {
    const { name, description, isPrivate, showOnProfile, image } = req.body;
    
    // 1. Basic Validation
    if (!name || !image) {
      return res.status(400).json({ message: "Feed name and image path are required." });
    }
    
    // 2. Check for Duplicates (Manual check for better error message clarity)
    const exists = await CustomFeed.findOne({ name });
    if (exists) {
        return res.status(409).json({ message: "A custom feed with this name already exists." });
    }

    // 3. Create the new Custom Feed
    const customFeed = await CustomFeed.create({
      name,
      description,
      isPrivate,
      showOnProfile,
      image,
      author: req.userId, // req.userId should be set by authMiddleware
      communities: [], 
    });

    // 4. Return success response
    // The successful creation should trigger the MongoDB collection creation.
    return res.status(201).json(customFeed); 

  } catch (err) {
    // Check for Mongoose Validation Errors (e.g., if a field limit was violated)
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    
    console.error("Error creating custom feed:", err);
    return res.status(500).json({ message: "Internal server error" });
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