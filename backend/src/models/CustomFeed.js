import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const CustomFeedSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 500,
    default: ""
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  communities: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
<<<<<<< HEAD
=======
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
  isPrivate: {
    type: Boolean,
    default: false,
  },
  showOnProfile: {
    type: Boolean,
    default: true,
  },
  image: { 
    type: String,
    required: true, 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

<<<<<<< HEAD
export default model('CustomFeed', CustomFeedSchema);
=======
export default model('CustomFeed', CustomFeedSchema);
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5
