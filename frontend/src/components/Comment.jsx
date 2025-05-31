import React, { useEffect, useState } from "react";
import { get, put } from "../services/endpoints";
import ClipLoader from "react-spinners/ClipLoader";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";

const Comment = ({ comment }) => {
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [hasReplies, setHasReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false); // fallback if you support it

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await get(`/comments/reply/${comment._id}`);
      const repliesData = res.replies || [];
      setReplies(repliesData);
      setHasReplies(repliesData.length > 0);
    } catch (err) {
      console.error("Failed to load replies", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleToggleReplies = () => {
    if (!showReplies && !hasReplies) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleLike = async (commentId) => {
    try {
      const res = await put(`/comments/like/${commentId}`);
      if (res.success) {
        setLikesCount(res.likesCount);
        setIsLiked(res.isLiked);
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  return (
    <div className="border-t border-gray-700 pt-4 mt-4 ml-0">
      <div className="flex items-start gap-3">
        <img
          src={comment.user.profilePicture || "/default-avatar.png"}
          alt="profile"
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <p className="text-sm text-gray-300 font-semibold">
            {comment.user.fullName}{" "}
            <span className="text-gray-500">@{comment.user.username}</span>
          </p>
          <p className="text-gray-200 mt-1">{comment.text}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </p>

          {/* Actions: Likes and Replies count */}
          <div
            className="flex items-center gap-6 text-gray-400 mt-3 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {isLiked ? (
              <div
                className={
                  "flex items-center gap-1 cursor-pointer text-red-500"
                }
                onClick={() => handleLike(comment._id)}
              >
                <FaHeart />
                <span>{likesCount}</span>
              </div>
            ) : (
              <div
                className={"flex items-center gap-1 cursor-pointer"}
                onClick={() => handleLike(comment._id)}
              >
                <FaRegHeart />
                <span>{likesCount}</span>
              </div>
            )}
            <div
              className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"
              onClick={handleToggleReplies}
            >
              <FaRegComment />
              <span>{hasReplies ? replies.length : 0}</span>
            </div>
          </div>

          {hasReplies && (
            <button
              onClick={handleToggleReplies}
              className="text-sm text-blue-400 mt-2"
            >
              {showReplies ? "Hide Replies" : "View Replies"}
            </button>
          )}

          {loadingReplies && (
            <div className="mt-2">
              <ClipLoader color="#ffffff" size={20} />
            </div>
          )}

          {/* Nested replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 ml-6 space-y-4">
              {replies.map((reply) => (
                <Comment key={reply._id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
