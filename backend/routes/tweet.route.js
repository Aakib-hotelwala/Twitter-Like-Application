import express from "express";
import {
  CreateTweetController,
  GetTweetsController,
  UpdateTweetController,
  DeleteTweetController,
  LikeTweetController,
  RetweetController,
  GetTweetsByHashtagController,
  GetTrendingHashtagsController,
  GetTweetsByUsernameController,
  GetTweetByIdController,
  BookmarkTweetController,
} from "../controllers/tweet.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadImageMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  requireAuth,
  upload.single("image"),
  CreateTweetController
);
router.get("/all-tweets", requireAuth, GetTweetsController);
router.get("/trending-hashtags", requireAuth, GetTrendingHashtagsController);
router.get("/tweet/:id", requireAuth, GetTweetByIdController);
router.put(
  "/update/:id",
  requireAuth,
  upload.single("image"),
  UpdateTweetController
);
router.delete("/delete/:id", requireAuth, DeleteTweetController);
router.put("/like/:id", requireAuth, LikeTweetController);
router.put("/bookmark/:id", requireAuth, BookmarkTweetController);
router.post("/retweet/:id", requireAuth, RetweetController);
router.get("/hashtag/:hashtag", requireAuth, GetTweetsByHashtagController);
router.get("/user/:username", requireAuth, GetTweetsByUsernameController);

export default router;
