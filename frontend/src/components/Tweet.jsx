import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegComment,
  FaRegHeart,
  FaRetweet,
} from "react-icons/fa";

const Tweet = ({
  user,
  tweet,
  isLiked,
  handleLike,
  isBookmarked,
  handleBookmark,
  isFollowing,
  handleFollowToggle,
}) => {
  const navigate = useNavigate();

  const onTweetClick = () => {
    navigate(`/tweet/${tweet._id}`, {
      state: { tweetId: tweet._id },
    });
  };

  const formatContentWithHashtags = (text) => {
    return text.split(" ").map((word, index) =>
      word.startsWith("#") ? (
        <span key={index} className="text-blue-400 mr-1">
          {word}
        </span>
      ) : (
        <span key={index} className="mr-1">
          {word}
        </span>
      )
    );
  };

  return (
    <div
      className="bg-[#15202b] text-white p-4 rounded-xl border border-gray-700 hover:bg-[#1a2a3a] transition duration-200"
      onClick={onTweetClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <img
            src={tweet.user.profilePicture || "/default-avatar.png"}
            alt={tweet.user.username}
            className="w-10 h-10 rounded-full mr-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${tweet.user.username}`);
            }}
          />
          <div>
            <h4 className="font-semibold">{tweet.user.fullName}</h4>
            <span
              className="text-sm text-gray-400 hover:text-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${tweet.user.username}`);
              }}
            >
              @{tweet.user.username}
            </span>
          </div>
        </div>

        {/* Follow Button */}
        {tweet.user._id !== user?._id && (
          <button
            className="text-sm px-3 py-1 rounded-full border border-white text-white hover:bg-white hover:text-black transition duration-150 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleFollowToggle(tweet.user._id);
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-2 text-gray-100">
        {formatContentWithHashtags(tweet.content)}
      </div>
      {tweet.image && (
        <img
          src={tweet.image}
          alt="tweet"
          className="mt-2 rounded-lg border border-gray-700"
        />
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
            className={"flex items-center gap-1 cursor-pointer text-red-500"}
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

        <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
          <FaRegComment />
          <span>{tweet.commentCount || 0}</span>
        </div>
        {isBookmarked ? (
          <div
            className={"flex items-center gap-1 cursor-pointer text-blue-700"}
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
};

export default Tweet;
