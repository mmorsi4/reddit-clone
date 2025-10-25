import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT;
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",  // your React app
  credentials: true,                // allow sending cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api",authRoute)

// Example routes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
