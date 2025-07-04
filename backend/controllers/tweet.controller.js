import TweetModel from "../models/tweet.model.js";
import cloudinary from "../config/cloudinary.js";
import UserModel from "../models/user.model.js";
import CommentModel from "../models/comment.model.js";

// =============== Create Tweet ===============
export const CreateTweetController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, retweet } = req.body;

    const image = req.file?.path || null;

    if (!content && !image && !retweet) {
      return res
        .status(400)
        .json({ error: true, message: "Tweet content or image is required" });
    }

    const newTweet = new TweetModel({
      content,
      image,
      user: userId,
      retweet: retweet || null,
    });

    await newTweet.save();

    return res.status(201).json({
      success: true,
      message: "Tweet created successfully",
      tweet: newTweet,
    });
  } catch (error) {
    console.error("Create Tweet Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// =============== Get Tweets (all or user) ===============
export const GetTweetsController = async (req, res) => {
  try {
    const userId = req.query.userId;
    let filter = { isDeleted: false };
    if (userId) filter.user = userId;

    const tweets = await TweetModel.find(filter)
      .populate("user", "fullName username profilePicture")
      .populate("retweet")
      .sort({ createdAt: -1 })
      .lean(); // use .lean() to allow adding commentCount manually

    // Fetch comment counts in parallel for better performance
    const tweetIds = tweets.map((t) => t._id);
    const commentCounts = await CommentModel.aggregate([
      { $match: { tweet: { $in: tweetIds }, isDeleted: false } },
      { $group: { _id: "$tweet", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    commentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const tweetsWithCommentCount = tweets.map((tweet) => ({
      ...tweet,
      commentCount: countMap[tweet._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      tweets: tweetsWithCommentCount,
    });
  } catch (error) {
    console.error("Get Tweets Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// =============== Get Single Tweet ===============
export const GetTweetByIdController = async (req, res) => {
  try {
    const tweetId = req.params.id;

    const tweet = await TweetModel.findById(tweetId)
      .populate("user", "fullName username profilePicture")
      .populate("retweet")
      .lean();

    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: true, message: "Tweet not found" });
    }

    const commentCount = await CommentModel.countDocuments({
      tweet: tweet._id,
      isDeleted: false,
    });

    tweet.commentCount = commentCount;

    return res.status(200).json({
      success: true,
      tweet,
    });
  } catch (error) {
    console.error("Get Tweet By ID Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// =============== Update Tweet ===============
export const UpdateTweetController = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    const tweet = await TweetModel.findById(tweetId);
    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: true, message: "Tweet not found" });
    }

    if (tweet.user.toString() !== userId) {
      return res.status(403).json({ error: true, message: "Not authorized" });
    }

    if (!content && !req.file) {
      return res.status(400).json({
        error: true,
        message: "No content or image provided for update",
      });
    }

    if (content) tweet.content = content;
    if (req.file?.path) tweet.image = req.file.path;

    await tweet.save();

    return res.status(200).json({
      success: true,
      message: "Tweet updated successfully",
      tweet,
    });
  } catch (error) {
    console.error("Update Tweet Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// =============== Delete Tweet (soft delete) ===============
export const DeleteTweetController = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role; // assuming you pass role from middleware

    const tweet = await TweetModel.findById(tweetId);
    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: true, message: "Tweet not found" });
    }

    // Allow deletion if user is tweet owner OR admin
    if (tweet.user.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ error: true, message: "Not authorized" });
    }

    tweet.isDeleted = true;
    await tweet.save();

    return res.status(200).json({
      success: true,
      message: "Tweet deleted successfully",
    });
  } catch (error) {
    console.error("Delete Tweet Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// =============== Like / Unlike Tweet ===============
export const LikeTweetController = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const userId = req.user.id;

    const tweet = await TweetModel.findById(tweetId);
    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: true, message: "Tweet not found" });
    }

    const likedIndex = tweet.likes.indexOf(userId);
    if (likedIndex === -1) {
      // Like
      tweet.likes.push(userId);
    } else {
      // Unlike
      tweet.likes.splice(likedIndex, 1);
    }
    await tweet.save();

    return res.status(200).json({
      success: true,
      message: likedIndex === -1 ? "Tweet liked" : "Tweet unliked",
      likesCount: tweet.likes.length,
    });
  } catch (error) {
    console.error("Like Tweet Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// =============== Bookmark Tweet ===============
export const BookmarkTweetController = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const userId = req.user.id;

    const tweet = await TweetModel.findById(tweetId);
    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: true, message: "Tweet not found" });
    }

    const isBookmarked = tweet.bookmarks.includes(userId);
    if (isBookmarked) {
      tweet.bookmarks.pull(userId); // Remove
    } else {
      tweet.bookmarks.push(userId); // Add
    }

    await tweet.save();

    return res.status(200).json({
      success: true,
      message: isBookmarked ? "Bookmark removed" : "Tweet bookmarked",
      bookmarked: !isBookmarked,
    });
  } catch (error) {
    console.error("Bookmark Tweet Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// =============== Retweet ===============
export const RetweetController = async (req, res) => {
  try {
    const userId = req.user.id;
    const tweetId = req.params.id;

    const originalTweet = await TweetModel.findById(tweetId);
    if (!originalTweet || originalTweet.isDeleted) {
      return res
        .status(404)
        .json({ error: true, message: "Original tweet not found" });
    }

    const existingRetweet = await TweetModel.findOne({
      user: userId,
      retweet: tweetId,
      isDeleted: false,
    });

    if (existingRetweet) {
      return res
        .status(400)
        .json({ error: true, message: "You already retweeted this tweet" });
    }

    const newRetweet = new TweetModel({
      user: userId,
      retweet: tweetId,
      content: "",
    });

    await newRetweet.save();

    return res.status(201).json({
      success: true,
      message: "Retweeted successfully",
      retweet: newRetweet,
    });
  } catch (error) {
    console.error("Retweet Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const GetTweetsByHashtagController = async (req, res) => {
  try {
    const hashtag = req.params.hashtag.toLowerCase();

    const tweets = await TweetModel.find({
      content: { $regex: new RegExp(`#${hashtag}\\b`, "i") },
      isDeleted: false,
    })
      .populate("user", "fullName username profilePicture")
      .populate("retweet")
      .sort({ createdAt: -1 })
      .lean();

    const tweetIds = tweets.map((t) => t._id);

    const commentCounts = await CommentModel.aggregate([
      { $match: { tweet: { $in: tweetIds }, isDeleted: false } },
      { $group: { _id: "$tweet", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    commentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const tweetsWithCommentCount = tweets.map((tweet) => ({
      ...tweet,
      commentCount: countMap[tweet._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: tweetsWithCommentCount.length,
      tweets: tweetsWithCommentCount,
    });
  } catch (error) {
    console.error("Get Tweets by Hashtag Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const GetTrendingHashtagsController = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentTweets = await TweetModel.find({
      createdAt: { $gte: oneDayAgo },
      isDeleted: false,
    }).select("content");

    const hashtagCounts = {};

    for (const tweet of recentTweets) {
      const hashtags = tweet.content.match(/#\w+/g);
      if (hashtags) {
        hashtags.forEach((tag) => {
          const cleanTag = tag.toLowerCase();
          hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1;
        });
      }
    }

    const sortedTrending = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ hashtag: tag, count }));

    const topHashtags = sortedTrending.slice(0, 10);

    return res.status(200).json({
      success: true,
      trending: topHashtags,
    });
  } catch (error) {
    console.error("Get Trending Hashtags Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const GetTweetsByUsernameController = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Get tweets
    const tweets = await TweetModel.find({ user: user._id, isDeleted: false })
      .populate("user", "fullName username profilePicture")
      .populate("retweet")
      .sort({ createdAt: -1 })
      .lean();

    const tweetIds = tweets.map((t) => t._id);
    const commentCounts = await CommentModel.aggregate([
      { $match: { tweet: { $in: tweetIds }, isDeleted: false } },
      { $group: { _id: "$tweet", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    commentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const tweetsWithCommentCount = tweets.map((tweet) => ({
      ...tweet,
      commentCount: countMap[tweet._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      tweets: tweetsWithCommentCount,
    });
  } catch (error) {
    console.error("Get Tweets by Username Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const GetBookmarkedTweetsController = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarkedTweets = await TweetModel.find({
      bookmarks: userId,
      isDeleted: false,
    })
      .populate("user", "fullName username profilePicture")
      .populate("retweet")
      .sort({ createdAt: -1 })
      .lean();

    const tweetIds = bookmarkedTweets.map((tweet) => tweet._id);
    const commentCounts = await CommentModel.aggregate([
      { $match: { tweet: { $in: tweetIds }, isDeleted: false } },
      { $group: { _id: "$tweet", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    commentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const tweetsWithCommentCount = bookmarkedTweets.map((tweet) => ({
      ...tweet,
      commentCount: countMap[tweet._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      tweets: tweetsWithCommentCount,
    });
  } catch (error) {
    console.error("Get Bookmarked Tweets Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
