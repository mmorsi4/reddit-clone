import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Comment', CommentSchema);
