import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import postsRoutes from './src/routes/posts.js';
import commentsRoutes from './src/routes/comments.js';
import communitiesRoutes from './src/routes/communities.js';
import usersRoutes from './src/routes/users.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();
const PORT = process.env.PORT || 5001;

await connectDB();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 1000*60,
  max: 100
});
app.use(limiter);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/users', usersRoutes);

// health
app.get('/', (req,res)=> res.send({ok:true, now: new Date().toISOString()}));

app.use(errorHandler);

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
