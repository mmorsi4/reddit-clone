import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  displayName: String,
  bio: String,
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
  karma_post: { type: Number, default: 0 },
  karma_comment: { type: Number, default: 0 },
  settings_theme: { type: String, default: "light" }
});

const communitySchema = new Schema({
  slug: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  membersCount: { type: Number, default: 1 },
  iconUrl: String
});

const membershipSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, default: "member" },
  joinedAt: { type: Date, default: Date.now }
});
membershipSchema.index({ communityId: 1, userId: 1 }, { unique: true });

const postSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  postType: { type: String, enum: ["text", "image", "video", "link"], required: true },
  body: String,
  mediaUrls: [String], // used for image or video posts
  linkUrl: String, // used for link posts
  aiSummary: String,
  tags: [String],
  score: { type: Number, default: 0 },
  upvotesCount: { type: Number, default: 0 },
  downvotesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const commentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  upvotesCount: { type: Number, default: 0 },
  downvotesCount: { type: Number, default: 0 },
  depth: { type: Number, default: 0 }
});

const voteSchema = new Schema({
  targetType: { type: String, enum: ["Post", "Comment"], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  vote: { type: Number, enum: [1, -1], required: true },
  createdAt: { type: Date, default: Date.now }
});
voteSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

export const User = model("User", userSchema);
export const Community = model("Community", communitySchema);
export const Membership = model("Membership", membershipSchema);
export const Post = model("Post", postSchema);
export const Comment = model("Comment", commentSchema);
export const Vote = model("Vote", voteSchema);