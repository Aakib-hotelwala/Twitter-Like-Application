import React, { useEffect, useState } from "react";
import {
  FaHeart,
  FaRetweet,
  FaRegComment,
  FaImage,
  FaTrash,
  FaBookmark,
  FaRegBookmark,
  FaRegHeart,
} from "react-icons/fa";
import { get, put, post } from "../services/endpoints";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-hot-toast";

const TweetFeed = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleTweetSubmit = async () => {
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      await post("/tweets/create", formData);
      setContent("");
      setImage(null);
      setPreview(null);
      fetchTweets();
    } catch (error) {
      console.error("Error posting tweet:", error);
    }
  };

  const fetchTweets = async () => {
    try {
      const res = await get("/tweets/all-tweets");
      if (res.success) {
        setTweets(res.tweets);
      }
    } catch (error) {
      console.error("Error fetching tweets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleLike = async (tweetId) => {
    try {
      const res = await put(`/tweets/like/${tweetId}`);
      if (res.success) {
        fetchTweets();
      }
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  };

  const handleBookmark = async (tweetId) => {
    try {
      const res = await put(`/tweets/bookmark/${tweetId}`);
      if (res.success) {
        fetchTweets();
      }
    } catch (error) {
      console.error("Error Bookmarking tweet:", error);
    }
  };

  const formatContentWithHashtags = (content) => {
    const hashtagRegex = /#[\w]+/g;
    return content.split(hashtagRegex).reduce((acc, part, index, arr) => {
      acc.push(part);
      const match = content.match(hashtagRegex);
      if (match && match[index]) {
        acc.push(
          <span key={index} className="text-blue-400">
            {match[index]}
          </span>
        );
      }
      return acc;
    }, []);
  };

  return (
    <>
      {/* Tweet Composer */}
      <div className="bg-[#16181C] p-4 rounded border border-gray-700">
        <textarea
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 bg-[#16181C] text-white border border-gray-600 rounded resize-none focus:outline-none focus:ring focus:ring-blue-500"
          rows="2"
        ></textarea>

        {preview && (
          <div className="relative mt-2 inline-block">
            <img src={preview} alt="preview" className="w-40 rounded" />
            <button
              onClick={() => {
                setPreview(null);
                setImage(null);
              }}
              className="absolute top-0 right-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              aria-label="Remove image"
              type="button"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <label className="bg-gray-800 text-white px-4 py-1 rounded cursor-pointer flex items-center gap-2 hover:bg-blue-700">
            <FaImage className="text-xl" />
            <span className="text-sm">Add Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <button
            onClick={handleTweetSubmit}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 cursor-pointer"
          >
            Tweet
          </button>
        </div>
      </div>

      {/* Tweets List */}
      <div className="space-y-4 mt-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <ClipLoader color="#9ca3af" size={40} />
          </div>
        ) : tweets.length === 0 ? (
          <p className="text-center text-gray-400">No tweets found.</p>
        ) : (
          tweets.map((tweet) => {
            const isLiked = tweet.likes.includes(user._id);
            const isBookmarked = tweet.bookmarks?.includes(user._id);

            const onTweetClick = () => {
              navigate(`/tweet/${tweet._id}`, {
                state: { tweetId: tweet._id },
              });
            };

            return (
              <div
                key={tweet._id}
                className="bg-[#16181C] text-white p-4 rounded border border-gray-700 hover:bg-[#1d1f23] cursor-pointer"
                onClick={onTweetClick}
              >
                {/* Header */}
                <div className="flex items-center mb-2">
                  <img
                    src={tweet.user.profilePicture || "/default-avatar.png"}
                    alt={tweet.user.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-semibold">{tweet.user.fullName}</h4>
                    <span className="text-sm text-gray-400">
                      @{tweet.user.username}
                    </span>
                  </div>
                </div>

                {/* Tweet content */}
                <p className="mb-2">
                  {formatContentWithHashtags(tweet.content)}
                </p>
                {tweet.image && (
                  <img src={tweet.image} alt="tweet" className="mt-2 rounded" />
                )}

                {/* Time */}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(tweet.createdAt).toLocaleString()}
                </p>

                {/* Actions */}
                <div
                  className="flex items-center gap-6 text-gray-400 mt-3 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isLiked ? (
                    <div
                      className={
                        "flex items-center gap-1 cursor-pointer text-red-500"
                      }
                      onClick={() => handleLike(tweet._id)}
                    >
                      <FaHeart />
                      <span>{tweet.likes.length}</span>
                    </div>
                  ) : (
                    <div
                      className={"flex items-center gap-1 cursor-pointer"}
                      onClick={() => handleLike(tweet._id)}
                    >
                      <FaRegHeart />
                      <span>{tweet.likes.length}</span>
                    </div>
                  )}
                  <div
                    className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"
                    onClick={onTweetClick}
                  >
                    <FaRegComment />
                    <span>{tweet.commentCount || 0}</span>
                  </div>
                  {isBookmarked ? (
                    <div
                      className={
                        "flex items-center gap-1 cursor-pointer text-blue-700"
                      }
                      onClick={() => handleBookmark(tweet._id)}
                    >
                      <FaBookmark />
                    </div>
                  ) : (
                    <div
                      className={"flex items-center gap-1 cursor-pointer"}
                      onClick={() => handleBookmark(tweet._id)}
                    >
                      <FaRegBookmark />
                    </div>
                  )}
                  <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
                    <FaRetweet />
                    <span>{tweet.retweetCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default TweetFeed;
