import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import ConnectDB from "./utils/db.js";

// Routes
import userRoutes from "./routes/user.route.js";
import tweetRoutes from "./routes/tweet.route.js";
import commentRoutes from "./routes/comment.route.js";
import searchRoutes from "./routes/search.route.js";

dotenv.config();

const app = express();

// Connect to MongoDB
ConnectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/search", searchRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
