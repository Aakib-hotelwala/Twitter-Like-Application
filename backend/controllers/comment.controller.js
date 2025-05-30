import mongoose from "mongoose";
import CommentModel from "../models/comment.model.js";
import TweetModel from "../models/tweet.model.js"; // optional, for validation

// Create a new comment
export const CreateComment = async (req, res) => {
  try {
    const { text, tweet, parentComment } = req.body;
    const userId = req.user._id; // Assuming you get user id from auth middleware

    // Optional: Check if the tweet exists and is not deleted
    const tweetExists = await TweetModel.findOne({
      _id: tweet,
      isDeleted: false,
    });
    if (!tweetExists) {
      return res.status(404).json({ error: true, message: "Tweet not found" });
    }

    const newComment = new CommentModel({
      text,
      tweet,
      user: userId,
      parentComment: parentComment || null,
    });

    await newComment.save();

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Get comments by tweet (optionally only top-level comments)
export const GetCommentsByTweet = async (req, res) => {
  try {
    const tweetId = req.params.tweetId;
    const currentUserId = req.user._id;

    const comments = await CommentModel.find({
      tweet: tweetId,
      isDeleted: false,
      parentComment: null,
    })
      .populate("user", "username profilePicture") // populate user info
      .sort({ createdAt: -1 });

    // Add likesCount and isLiked properties
    const processedComments = comments.map((comment) => {
      const likesArray = comment.likes || [];
      return {
        ...comment.toObject(),
        likesCount: likesArray.length,
        isLiked: likesArray.some((userId) => userId.equals(currentUserId)),
      };
    });

    res.status(200).json({ success: true, comments: processedComments });
  } catch (error) {
    console.error("Get Comments By Tweet Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Get replies to a comment (nested comments)
export const GetRepliesByComment = async (req, res) => {
  try {
    const parentCommentId = req.params.commentId;

    const replies = await CommentModel.find({
      parentComment: parentCommentId,
      isDeleted: false,
    })
      .populate("user", "username profilePicture")
      .sort({ createdAt: 1 }); // older first

    res.status(200).json({ success: true, replies });
  } catch (error) {
    console.error("Get Replies By Comment Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Update comment (only by owner)
export const UpdateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;
    const { text } = req.body;

    const comment = await CommentModel.findById(commentId);

    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ error: true, message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: true, message: "Unauthorized to update this comment" });
    }

    comment.text = text;
    await comment.save();

    res.status(200).json({ success: true, comment });
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Soft delete comment (only by owner)
export const DeleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const comment = await CommentModel.findById(commentId);

    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ error: true, message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: true, message: "Unauthorized to delete this comment" });
    }

    comment.isDeleted = true;
    await comment.save();

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Like or Unlike a comment
export const ToggleLikeComment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    const commentId = req.params.commentId;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid Comment ID" });
    }

    const comment = await CommentModel.findById(commentId);

    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ error: true, message: "Comment not found" });
    }

    comment.likes = comment.likes || [];

    const hasLiked = comment.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (hasLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      likesCount: comment.likes.length,
      isLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Toggle Like Comment Error:", error); // Log exact error
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
