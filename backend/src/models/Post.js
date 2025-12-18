// models/Post.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const VoteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  value: { type: Number, enum: [1, -1] },
  createdAt: { type: Date, default: Date.now }  
}, { _id: false });

const PostSchema = new Schema({
  title: { type: String, required: true },
  body: String,
  url: String,
  mediaUrl: String,
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: Schema.Types.ObjectId, ref: 'Community' },
  
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  hiddenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  saves: { type: Number, default: 0 },
  votes: [VoteSchema],
  score: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Add index for savedBy to improve query performance
PostSchema.index({ savedBy: 1 });

PostSchema.pre('save', function(next){
  this.score = this.votes.reduce((s,v)=>s+(v.value||0),0);
  next();
});

export default model('Post', PostSchema);