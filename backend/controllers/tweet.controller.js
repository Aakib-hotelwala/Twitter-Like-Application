import TweetModel from "../models/tweet.model.js";
import cloudinary from "../config/cloudinary.js";
import UserModel from "../models/user.model.js";

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
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tweets,
    });
  } catch (error) {
    console.error("Get Tweets Error:", error);
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

// =============== Retweet ===============
export const RetweetController = async (req, res) => {
  try {
    const userId = req.user.id;
    const tweetId = req.params.id;

    // Check if the tweet exists
    const originalTweet = await TweetModel.findById(tweetId);
    if (!originalTweet || originalTweet.isDeleted) {
      return res
        .status(404)
        .json({ error: true, message: "Original tweet not found" });
    }

    // Check if user already retweeted this tweet
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
      content: "", // retweet content usually empty
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
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tweets.length,
      tweets,
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

    const tweets = await TweetModel.find({ user: user._id, isDeleted: false })
      .populate("user", "fullName username profilePicture")
      .populate("retweet")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tweets,
    });
  } catch (error) {
    console.error("Get Tweets by Username Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
