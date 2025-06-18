// src/components/TweetsByUsername.jsx

import React, { useEffect, useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaBookmark,
  FaRegBookmark,
  FaRetweet,
} from "react-icons/fa";
import { get, put } from "../services/endpoints";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const TweetsByUsername = ({ username }) => {
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserTweets = async () => {
    try {
      const res = await get(`/tweets/user/${username}`);
      if (res.success) {
        setTweets(res.tweets);
      }
    } catch (error) {
      console.error("Error fetching user tweets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserTweets();
    }
  }, [username]);

  const handleLike = async (tweetId) => {
    try {
      await put(`/tweets/like/${tweetId}`);
      fetchUserTweets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async (tweetId) => {
    try {
      await put(`/tweets/bookmark/${tweetId}`);
      fetchUserTweets();
    } catch (err) {
      console.error(err);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <ClipLoader color="#9ca3af" size={40} />
      </div>
    );
  }

  if (!tweets.length) {
    return <p className="text-center text-gray-400 py-10">No tweets yet.</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {tweets.map((tweet) => {
        const isLiked = tweet.likes.includes(currentUser?._id);
        const isBookmarked = tweet.bookmarks?.includes(currentUser?._id);

        const onTweetClick = () =>
          navigate(`/tweet/${tweet._id}`, {
            state: { tweetId: tweet._id },
          });

        return (
          <div
            key={tweet._id}
            className="bg-[#16181C] p-4 rounded border border-gray-700 hover:bg-[#1d1f23]"
          >
            <div className="flex items-center mb-2">
              <img
                src={tweet.user.profilePicture || "/default-avatar.png"}
                alt={tweet.user.username}
                className="w-10 h-10 rounded-full mr-3 cursor-pointer"
                onClick={() => navigate(`/profile/${tweet.user.username}`)}
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
              <img src={tweet.image} alt="tweet" className="rounded mt-2" />
            )}

            <p className="text-xs text-gray-500 mt-2">
              {new Date(tweet.createdAt).toLocaleString()}
            </p>

            <div className="flex items-center gap-6 text-gray-400 mt-3 text-sm">
              <div
                onClick={() => handleLike(tweet._id)}
                className={`flex items-center gap-1 cursor-pointer ${
                  isLiked ? "text-red-500" : ""
                }`}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span>{tweet.likes.length}</span>
              </div>
              <div
                className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"
                onClick={onTweetClick}
              >
                <FaRegComment />
                <span>{tweet.commentCount || 0}</span>
              </div>
              <div
                onClick={() => handleBookmark(tweet._id)}
                className={`flex items-center gap-1 cursor-pointer ${
                  isBookmarked ? "text-blue-700" : ""
                }`}
              >
                {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
              </div>
              <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
                <FaRetweet />
                <span>{tweet.retweetCount || 0}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TweetsByUsername;
