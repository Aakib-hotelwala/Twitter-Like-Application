import express from "express";
import {
  CreateComment,
  GetCommentsByTweet,
  GetRepliesByComment,
  UpdateComment,
  DeleteComment,
  ToggleLikeComment,
} from "../controllers/comment.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", requireAuth, CreateComment);
router.get("/tweet/:tweetId", requireAuth, GetCommentsByTweet);
router.get("/reply/:commentId", requireAuth, GetRepliesByComment);
router.put("/update/:commentId", requireAuth, UpdateComment);
router.delete("/delete/:commentId", requireAuth, DeleteComment);
router.put("/like/:commentId", requireAuth, ToggleLikeComment);

export default router;
