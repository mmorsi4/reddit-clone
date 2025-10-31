import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Community from "../models/Community.js";

dotenv.config();

await connectDB();

const communities = [
  {
    name: "reddit",
    title: "r/reddit",
    description: "The original subreddit, now archived.",
    avatar: "/images/community-avatar1.jpg",
    banner: "/images/community-banner.png",

  },
  {
    name: "harrypotter",
    title: "r/harrypotter",
    description: "Welcome to r/HarryPotter, where fans around the world gather to discuss everything magical.",
    avatar: "/images/community-avatar2.jpg",
    banner: "/images/community-banner2.jpg",
  },
  {
    name: "playstation",
    title: "r/playstation",
    description: "Your hub for all things PlayStation — games, news, and community.",
    avatar: "/images/community-avatar3.jpg",
    banner: "/images/community-banner3.png",
  },
  {
    name: "GoodCoffeeGreatCoffee",
    title: "r/GoodCoffeeGreatCoffee",
    description: "Coffee lovers unite! Discuss brewing tips, beans, gear, and more.",
    avatar: "/images/community-avatar4.jpg",
    banner: "/images/community-banner4.png",
  }
];

const seedCommunities = async () => {
  try {
    console.log("🧹 Clearing old communities...");
    await Community.deleteMany({});

    console.log("🌱 Inserting new communities...");
    const communitiesWithUrl = communities.map(c => ({
      ...c,
      url: `/community/${c.name}`
    }));
    await Community.insertMany(communitiesWithUrl);

    console.log("✅ Communities seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding communities:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedCommunities();