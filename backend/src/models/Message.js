import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const MessageScehma = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },  
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: {type: String, required: true },
  time: { type: Date, default: Date.now }
});

export default model('Message', MessageScehma);