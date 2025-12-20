import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  displayName: String,
  bio: String,
  avatarUrl: String,
  karma: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  recentCommunityIds: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
  selectedChatUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});


export default model('User', UserSchema);
