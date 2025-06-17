import React, { useEffect, useState } from "react";
import {
  FaHeart,
  FaRetweet,
  FaRegComment,
  FaBookmark,
  FaRegBookmark,
  FaRegHeart,
} from "react-icons/fa";
import { get, put } from "../services/endpoints";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const BookmarkedTweets = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await get("/tweets/bookmarks");
      if (res.success) {
        setBookmarks(res.tweets);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (tweetId) => {
    try {
      const res = await put(`/tweets/like/${tweetId}`);
      if (res.success) {
        fetchBookmarks();
      }
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  };

  const handleBookmark = async (tweetId) => {
    try {
      const res = await put(`/tweets/bookmark/${tweetId}`);
      if (res.success) {
        fetchBookmarks();
      }
    } catch (error) {
      console.error("Error bookmarking tweet:", error);
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

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="space-y-4 mt-4">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <ClipLoader color="#9ca3af" size={40} />
        </div>
      ) : bookmarks.length === 0 ? (
        <p className="text-center text-gray-400">No bookmarked tweets.</p>
      ) : (
        bookmarks.map((tweet) => {
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

              <p className="mb-2">{formatContentWithHashtags(tweet.content)}</p>
              {tweet.image && (
                <img src={tweet.image} alt="tweet" className="mt-2 rounded" />
              )}

              <p className="text-xs text-gray-500 mt-2">
                {new Date(tweet.createdAt).toLocaleString()}
              </p>

              <div
                className="flex items-center gap-6 text-gray-400 mt-3 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {isLiked ? (
                  <div
                    className="flex items-center gap-1 cursor-pointer text-red-500"
                    onClick={() => handleLike(tweet._id)}
                  >
                    <FaHeart />
                    <span>{tweet.likes.length}</span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 cursor-pointer"
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
                    className="flex items-center gap-1 cursor-pointer text-blue-700"
                    onClick={() => handleBookmark(tweet._id)}
                  >
                    <FaBookmark />
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 cursor-pointer"
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
  );
};

export default BookmarkedTweets;
