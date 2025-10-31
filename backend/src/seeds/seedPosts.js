import mongoose from "mongoose";
import dotenv from "dotenv";
import { Post, Comment, User, Community } from "../models.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error(err));

const postsData = [
  {
    communityName: "reddit",
    authorUsername: "DevMaster",
    title: "React vs Vue in 2025",
    postType: "text",
    body: "Which one do you prefer for new projects?",
    tags: ["react", "vue", "frontend"],
  },
  {
    communityName: "harrypotter",
    authorUsername: "WizardFan",
    title: "Bulletin board tips",
    postType: "text",
    body: "I recently have been doing the bulletin boards ...",
    tags: ["gaming", "tips"],
  },
  {
    communityName: "playstation",
    authorUsername: "GamerX",
    title: "My collection so far",
    postType: "image",
    mediaUrls: ["/images/post_image1.png"],
    tags: ["collection", "gaming"],
  },
  {
    communityName: "GoodCoffeeGreatCoffee",
    authorUsername: "CoffeeLover123",
    title: "Best brewing method for cold brew?",
    postType: "text",
    body: "I've been experimenting with cold brew at home...",
    tags: ["coffee", "brewing"],
  },
];

const seedPosts = async () => {
  try {
    for (const data of postsData) {
      const user = await User.findOne({ username: data.authorUsername });
      const community = await Community.findOne({ name: data.communityName });

      if (!user || !community) {
        console.warn(`⚠️ Skipped: missing user or community for '${data.title}'`);
        continue;
      }

      const post = new Post({
        communityId: community._id,
        authorId: user._id,
        title: data.title,
        postType: data.postType,
        body: data.body,
        mediaUrls: data.mediaUrls || [],
        tags: data.tags || [],
      });

      await post.save();
      console.log(`✅ Added post: ${data.title}`);
    }

    console.log("🎉 All posts added successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};

seedPosts();