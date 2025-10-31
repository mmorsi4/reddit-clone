import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reddit_clone';

async function connectDB(){
  try{
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  }catch(e){
    console.error('MongoDB connection error', e);
    process.exit(1);
  }
}

export default connectDB;
