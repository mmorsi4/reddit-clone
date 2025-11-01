import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const CommunitySchema = new Schema({
  name: { type: String, required: true, unique: true },
  title: String,
  description: String,
  avatar: { type: String, default: "" }, 
  banner: { type: String, default: "" }, 
  url: { type: String },
  createdAt: { type: Date, default: Date.now },
});

CommunitySchema.pre('save', function(next) {
  this.url = `/community/${this.name}`;
  next();
});

export default model('Community', CommunitySchema);