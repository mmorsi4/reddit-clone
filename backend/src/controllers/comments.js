import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Create a comment and increment commentCount
export async function createComment(req, res) {
  try {
    const { post, parent, body } = req.body;

    const postDoc = await Post.findById(post);
    if (!postDoc) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      post,
      parent: parent || null,
      author: req.userId,
      body,
    });

    // increment comment count
    await Post.findByIdAndUpdate(post, { $inc: { commentCount: 1 } });

    // ✅ POPULATE AUTHOR BEFORE RETURNING
    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "username avatarUrl");

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Failed to create comment" });
  }
}


// Delete a comment and decrement commentCount
export async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await comment.deleteOne();

    // decrement commentCount safely
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}

// Fetch user's comments with community info - FIXED VERSION
export async function getMyComments(req, res) {
  try {
    // FIRST: Get comments with post populated
    const comments = await Comment.find({ author: req.userId })
      .populate({
        path: 'post',
        select: 'title community author', // Make sure community is selected
      })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .lean(); // Use .lean() for better performance

    console.log("DEBUG - Raw comments from DB:", comments.length);
    if (comments.length > 0) {
      console.log("First comment's post field:", comments[0].post);
    }

    // SECOND: We need to populate communities separately because
    // the post's community might just be an ObjectId
    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        // Calculate score from votes
        const score = comment.votes?.reduce((sum, vote) => {
          return sum + (vote.value || 0);
        }, 0) || 0;

        // Get user's vote
        const userVote = comment.votes?.find(vote => 
          vote.user && vote.user.toString() === req.userId
        )?.value || 0;

        // Try to get community info
        let community = null;
        
        // If post exists and has community field
        if (comment.post && comment.post.community) {
          // If community is an ObjectId string, fetch it
          if (typeof comment.post.community === 'string') {
            try {
              const communityDoc = await mongoose.model('Community').findById(
                comment.post.community
              ).select('name avatar').lean();
              
              if (communityDoc) {
                community = {
                  _id: communityDoc._id,
                  name: communityDoc.name,
                  avatar: communityDoc.avatar || ''
                };
              }
            } catch (err) {
              console.error("Error fetching community:", err);
            }
          } 
          // If community is already populated (shouldn't happen with current code)
          else if (comment.post.community.name) {
            community = {
              _id: comment.post.community._id,
              name: comment.post.community.name,
              avatar: comment.post.community.avatar || ''
            };
          }
        }

        // Return formatted comment
        return {
          _id: comment._id,
          body: comment.body,
          createdAt: comment.createdAt,
          votes: comment.votes || [],
          score: score,
          userVote: userVote,
          author: comment.author,
          post: {
            _id: comment.post?._id,
            title: comment.post?.title,
            community: community // Now this will have data!
          }
        };
      })
    );

    // Debug: Check what we're sending
    console.log("DEBUG - Formatted comments ready to send:", {
      count: formattedComments.length,
      firstComment: formattedComments.length > 0 ? {
        hasPost: !!formattedComments[0].post,
        hasCommunity: !!formattedComments[0].post?.community,
        communityName: formattedComments[0].post?.community?.name,
        score: formattedComments[0].score
      } : null
    });

    res.json(formattedComments);
  } catch (err) {
    console.error("Error in getMyComments:", err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
}

export async function voteComment(req, res) {
  try {
    const { value } = req.body;
    if (![1, -1, 0].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    // Initialize votes array if it doesn't exist
    comment.votes = comment.votes || [];
    
    // Remove existing vote from this user
    comment.votes = comment.votes.filter(v => v.user.toString() !== req.userId);
    
    // Add new vote if value is not 0
    if (value !== 0) {
      comment.votes.push({ user: req.userId, value });
    }
    await comment.save();
    
    // Verify the save worked
    const updatedComment = await Comment.findById(req.params.id);
    // Calculate total score
    const score = updatedComment.votes.reduce((total, vote) => total + vote.value, 0);
    res.json({ 
      score,
      userVote: value 
    });
    
  } catch (err) {
    console.error("Error voting on comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
// Get replies for a specific comment
export async function getCommentReplies(req, res) {
  try {
    const commentId = req.params.id;
    
    const replies = await Comment.find({ parent: commentId })
      .populate('author', 'username displayName avatarUrl')
      .sort({ createdAt: 1 })
      .lean();

    // Add vote information to each reply
    const repliesWithVotes = replies.map(reply => {
      const userVote = reply.votes?.find(v => v.user && v.user.toString() === req.userId);
      const score = reply.votes?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
      
      return {
        ...reply,
        userVote: userVote ? userVote.value : 0,
        upvotes: score,
        score: score
      };
    });

    res.json(repliesWithVotes);
  } catch (err) {
    console.error("Error fetching comment replies:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}