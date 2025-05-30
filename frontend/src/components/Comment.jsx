import React, { useEffect, useState } from "react";
import { get } from "../services/endpoints";
import ClipLoader from "react-spinners/ClipLoader";

const Comment = ({ comment }) => {
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await get(`/comments/reply/${comment._id}`);
      setReplies(res.replies || []);
    } catch (err) {
      console.error("Failed to load replies", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies && replies.length === 0) {
      fetchReplies();
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
        <div>
          <p className="text-sm text-gray-300 font-semibold">
            {comment.user.fullName}{" "}
            <span className="text-gray-500">@{comment.user.username}</span>
          </p>
          <p className="text-gray-200 mt-1">{comment.text}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </p>

          <button
            onClick={handleToggleReplies}
            className="text-sm text-blue-400 mt-2"
          >
            {showReplies ? "Hide Replies" : "View Replies"}
          </button>

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
