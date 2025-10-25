import express from "express";
import { User, Community, Membership, Post, Comment, Vote } from "../model/models.js";
import { authMiddleware } from "../middleware/auth.js";
import { Login, Signup } from "../controller/authController.js";


const router = express.Router();

// ✅ Signup route
router.post("/signup",Signup);

// ✅ Login route
router.post("/login",Login);

// test api
router.get("/view_profile", authMiddleware, async (req, res) => {

  const user = await User.findById(req.userId);
  res.status(200).json({ message: "User information retrieved", user}); 

});

export default router;