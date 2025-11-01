import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const MembershipSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, default: "member" },
  joinedAt: { type: Date, default: Date.now },
  favorite: { type: Boolean, default: false } 
});

MembershipSchema.index({ communityId: 1, userId: 1 }, { unique: true });

export default model('Membership', MembershipSchema);