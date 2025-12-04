import User from '../models/User.js';

export async function getProfile(req,res){
  const user = await User.findById(req.params.id).select('-passwordHash');
  if(!user) return res.status(404).json({message:'Not found'});
  res.json(user);
}

export async function getProfileByUsername(req, res) {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function me(req,res){
  const user = await User.findById(req.userId).select('-passwordHash');
  res.json(user);
}

export async function getRecentCommunities(req, res){
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('recentCommunityIds') // fill with recent communities data
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const recentCommunities = user.recentCommunityIds.map(community => ({
      _id: community._id,
      name: community.name,
      avatar: community.avatar,
      image: community.avatar, // keep both for compatibility
      link: `/community/${community.name}`
    }));

    res.status(200).json(recentCommunities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateRecentCommunities(req, res){
  try {
    const { communityId } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, [
      {
        $set: {
          recentCommunityIds: {
            $concatArrays: [
              [communityId], // push to the beginning
              {
                $filter: {
                  input: "$recentCommunityIds",
                  as: "id",
                  cond: { $ne: ["$$id", communityId] } // remove any duplicates
                }
              }
            ]
          }
        }
      },
      {
        $set: {
          recentCommunityIds: { $slice: ["$recentCommunityIds", 5] } // keep only 5
        }
      }
    ]);

    res.status(200).json({ message: "Recent communities updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find()
      .select('-passwordHash -email') // Exclude sensitive fields
      .sort({ createdAt: -1 }) // Most recent first\
      .lean();

    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
}
export async function updateAvatar(req, res) {
  try {
    const userId = req.userId;
    const { avatarData } = req.body; // We'll send the base64 image data
    
    if (!avatarData) {
      return res.status(400).json({ message: 'No avatar data provided' });
    }

    // Just save the base64 data directly to the database
    await User.findByIdAndUpdate(userId, { 
      avatarUrl: avatarData 
    });

    res.json({ 
      message: 'Avatar updated successfully',
      avatarUrl: avatarData 
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
}

export async function getSelectedChats(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .populate("selectedChatUsers", "_id username avatarUrl")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.selectedChatUsers || []);
  } catch (err) {
    console.error("Error fetching selected chats:", err);
    res.status(500).json({ message: "Server error while fetching chats" });
  }
}

export async function addSelectedChat(req, res) {
  try {
    const userId = req.userId;
    const { chatUserId } = req.body;

    if (!chatUserId) {
      return res.status(400).json({ message: "chatUserId is required" });
    }

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // prevent dupes
    const alreadyExists = user.selectedChatUsers.some(
      uid => uid.toString() === chatUserId
    );

    if (!alreadyExists) {
      user.selectedChatUsers.push(chatUserId);
      await user.save();
    }

    res.json({ success: true, message: "Chat user added" });

  } catch (err) {
    console.error("Error adding selected chat:", err);
    res.status(500).json({ message: "Server error while saving chat" });
  }
}
