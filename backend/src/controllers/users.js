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