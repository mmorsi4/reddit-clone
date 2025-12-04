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
import popularRoutes from "./src/routes/popular.js";
import commentsRoutes from './src/routes/comments.js';
import communitiesRoutes from './src/routes/communities.js';
import membershipsRouter from "./src/routes/membershipRoute.js"
import usersRoutes from './src/routes/users.js';
import customFeedRoutes from './src/routes/customFeed.js';
import messagesRoutes from './src/routes/messages.js';
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
  origin: '*',
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET","POST"]
  }
});

// multiple tabs -> multiple sockets for the same user
const userSocketMap = {}; // userId -> [socketId1, socketId2, ...]

// this is ALWAYS listening
io.on("connection", socket => {
  // client sends userId after connection, we register their socket.id in userSocketMap
  socket.on("register", userId => {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    if (!userSocketMap[userId].includes(socket.id)) {
      userSocketMap[userId].push(socket.id);
      console.log("User registered:", userId, "Socket:", socket.id);
    }
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

    const populated = await Message.findById(saved._id)
    .populate("sender", "_id username avatar")
    .populate("receiver", "_id username avatar");

    // send to all receiver sockets
    const receiverSockets = userSocketMap[receiver] || [];
    receiverSockets.forEach(sockId => {
      io.to(sockId).emit("receive_message", populated);
    });

    // send to all sender sockets too
    const senderSockets = userSocketMap[sender] || [];
    senderSockets.forEach(sockId => {
      io.to(sockId).emit("receive_message", populated);
    });
  });

  // remove user on disconnect (remove the disconnected socket.id)
  socket.on("disconnect", () => {
    for (const uid in userSocketMap) {
      userSocketMap[uid] = userSocketMap[uid].filter(sid => sid !== socket.id);
      if (userSocketMap[uid].length === 0) {
        delete userSocketMap[uid]; // remove if no more sockets
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
app.use("/api/popular", popularRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/communities', communitiesRoutes);
app.use("/api/memberships", membershipsRouter);
app.use('/api/users', usersRoutes);
app.use('/api/customfeeds', customFeedRoutes);
app.use('/api/messages', messagesRoutes);

// media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// health
app.get('/', (req,res)=> res.send({ok:true, now: new Date().toISOString()}));

app.use(errorHandler);

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
