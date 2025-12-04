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
import membershipsRouter from "./src/routes/membershipRoute.js"
import usersRoutes from './src/routes/users.js';
import customFeedRoutes from './src/routes/customFeed.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'
import http from 'http'
import Message from './src/models/Message.js';

dotenv.config();
const PORT = process.env.PORT || 5001;

await connectDB();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
});

// this object has all concurrent users
const userSocketMap = {};

// this is ALWAYS listening
io.on("connection", socket => {
  // client sends userId after connection, we register their socket.id in userSocketMap
  socket.on("register", userId => {
    userSocketMap[userId] = socket.id;
    console.log("User registered:", userId, "Socket:", socket.id);
  });

  // handle message sending (this is an http message not an endpoint)
  // the "socket" here is the socket of the sender
  socket.on("send_message", async data => {
    const { sender, receiver, text } = data;

    // create in db
    const saved = await Message.create({
      sender,
      receiver,
      text
    });

    // find receivers socket
    const receiverSocketId = userSocketMap[receiver];

    // do not broadcoast, only send the message to that user
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", saved);
    }

    // now send the same message to the sender to display in UI
    socket.emit("receive_message", saved);
  });

  // remove user on disconnect from concurrent users (remove their socket.id)
  socket.on("disconnect", () => {
    for (const uid in userSocketMap) {
      if (userSocketMap[uid] === socket.id) {
        delete userSocketMap[uid];
        break;
      }
    }
  });

});

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
app.use("/api/memberships", membershipsRouter);
app.use('/api/users', usersRoutes);
app.use('/api/customfeeds', customFeedRoutes);

// media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// health
app.get('/', (req,res)=> res.send({ok:true, now: new Date().toISOString()}));

app.use(errorHandler);

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
