import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const CommunitySchema = new Schema({
  name: { type: String, required: true, unique: true },
  title: String,
  description: String,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export default model('Community', CommunitySchema);
