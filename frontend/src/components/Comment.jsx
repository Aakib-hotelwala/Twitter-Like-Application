import React, { useEffect, useState } from "react";
import { get, put, post } from "../services/endpoints";
import ClipLoader from "react-spinners/ClipLoader";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Comment = ({ comment, depth = 0 }) => {
  const navigate = useNavigate();

  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [hasReplies, setHasReplies] = useState(comment.repliesCount > 0);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount || 0);

  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);

  const [replyBoxOpen, setReplyBoxOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (showReplies && hasReplies && replies.length === 0) {
      fetchReplies();
    }
  }, [showReplies, hasReplies, replies.length]);

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await get(`/comments/reply/${comment._id}`);
      const repliesData = res.replies || [];
      setReplies(repliesData);
      setRepliesCount(repliesData.length);
      setHasReplies(repliesData.length > 0);
    } catch (err) {
      console.error("Failed to load replies", err);
    } finally {
      setLoadingReplies(false);
    }
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

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await post("/comments/create", {
        text: replyText,
        tweet: comment.tweet,
        parentComment: comment._id,
      });

      if (res.success) {
        setReplyText("");
        setReplyBoxOpen(false); // Close input box after submit
        fetchReplies(); // Reload replies
        setShowReplies(true); // Show updated replies
        setRepliesCount((prev) => prev + 1);
        toast.success("Reply added");
      } else {
        toast.error("Failed to post reply");
      }
    } catch (err) {
      console.error("Failed to post reply", err);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-700 pt-4 mt-4 ml-0">
      <div className="flex items-start gap-3">
        <img
          src={comment.user.profilePicture || "/default-avatar.png"}
          alt="profile"
          className={`rounded-full cursor-pointer ${
            depth > 0 ? "w-6 h-6" : "w-8 h-8"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${comment.user.username}`);
          }}
        />

        <div className="flex flex-col w-full">
          <p className="text-sm text-gray-300 font-semibold">
            <span
              className="text-gray-500 hover:text-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${comment.user.username}`);
              }}
            >
              @{comment.user.username}
            </span>
          </p>
          <p className="text-gray-200 mt-1">{comment.text}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </p>

          {/* Like and Comment Icons */}
          <div
            className="flex items-center gap-6 text-gray-400 mt-3 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center gap-1 cursor-pointer ${
                isLiked ? "text-red-500" : ""
              }`}
              onClick={() => handleLike(comment._id)}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{likesCount}</span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {/* Send icon opens reply input */}
              <div
                className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"
                onClick={() => setReplyBoxOpen((prev) => !prev)}
              >
                <FiSend size={16} />
                <span>Reply</span>
              </div>
            </div>

            {/* Divider-style View Replies button */}
            {(comment.repliesCount > 0 ||
              replies.length > 0 ||
              showReplies) && (
              <div className="flex items-center gap-4 text-sm ">
                <button
                  onClick={() => {
                    if (!showReplies) fetchReplies();
                    setShowReplies((prev) => !prev);
                  }}
                  className="text-sm text-blue-400 hover:underline focus:outline-none cursor-pointer"
                >
                  {showReplies
                    ? "Hide replies"
                    : `View ${repliesCount} repl${
                        repliesCount === 1 ? "y" : "ies"
                      }`}
                </button>
              </div>
            )}
          </div>

          {loadingReplies && (
            <div className="mt-2">
              <ClipLoader color="#ffffff" size={20} />
            </div>
          )}

          {showReplies && replies.length > 0 && (
            <div className="mt-3 ml-4 pl-4 border-l border-gray-700 space-y-4">
              {replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  depth={(depth || 0) + 1}
                />
              ))}
            </div>
          )}

          {/* Reply Input */}
          {replyBoxOpen && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <textarea
                  rows={1}
                  placeholder="Write a reply..."
                  className="flex-grow p-2 rounded bg-[#1c1c1c] text-white border border-gray-600 resize-none"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={replyLoading}
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={replyLoading || !replyText.trim()}
                  className={`p-2 rounded ${
                    replyLoading || !replyText.trim()
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  } text-white flex items-center justify-center`}
                >
                  {replyLoading ? (
                    <ClipLoader color="#ffffff" size={18} />
                  ) : (
                    <FiSend size={18} />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setReplyBoxOpen(false);
                    setReplyText("");
                  }}
                  className="text-sm text-red-400 border border-red-400 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
