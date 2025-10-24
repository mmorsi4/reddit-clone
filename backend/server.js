import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/auth.js";
import { User, Community, Membership, Post, Comment, Vote } from "./models.js";
import { Navigate } from "react-router-dom";

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",  // your React app
  credentials: true,                // allow sending cookies
}));app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Example routes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ✅ Signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ username, email, passwordHash: password });

    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login route
app.post("/api/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });
    
    console.log(usernameOrEmail);
    console.log(password);

    if (!user || user.passwordHash !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    // Store in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// test api
app.get("/api/view_profile", authMiddleware, async (req, res) => {

  const user = await User.findById(req.userId);
  res.status(200).json({ message: "User information retrieved", user}); 

});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
