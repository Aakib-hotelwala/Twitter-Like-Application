import UserModel from "../models/user.model.js";
import TweetModel from "../models/tweet.model.js";

export const getSearchSuggestions = async (req, res) => {
  const query = req.query.query;

  if (!query || query.trim().length < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Query is required" });
  }

  try {
    const trimmedQuery = query.trim();

    const users = await UserModel.find({
      username: { $regex: `^${trimmedQuery.replace("@", "")}`, $options: "i" },
    })
      .limit(5)
      .select("username fullName profilePicture");

    const hashtagRegex = new RegExp(`#${trimmedQuery.replace("#", "")}`, "i");

    const tweets = await TweetModel.find({
      content: { $regex: hashtagRegex },
    }).select("content");

    const hashtagCounts = {};
    tweets.forEach((tweet) => {
      const hashtags = tweet.content.match(/#[\w]+/g);
      if (hashtags) {
        hashtags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          if (lowerTag.includes(trimmedQuery.toLowerCase())) {
            hashtagCounts[lowerTag] = (hashtagCounts[lowerTag] || 0) + 1;
          }
        });
      }
    });

    const hashtags = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag: hashtag.replace("#", ""), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      users,
      hashtags,
    });
  } catch (error) {
    console.error("Error in getSearchSuggestions:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
