import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tweet from "../components/Tweet";
import Comment from "../components/Comment";
import { get, put, post } from "../services/endpoints"; // add `post`
import useAuthStore from "../store/authStore";
import ClipLoader from "react-spinners/ClipLoader";
import { FiSend } from "react-icons/fi";
import { toast } from "react-hot-toast";

const TweetPage = () => {
  const { user } = useAuthStore();
  const { id: tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTweetAndComments = async () => {
    const tweetRes = await get(`/tweets/${tweetId}`);
    setTweet(tweetRes.tweet);

    const commentsRes = await get(`/comments/tweet/${tweetId}`);
    setComments(commentsRes.comments);
  };

  useEffect(() => {
    fetchTweetAndComments();
  }, [tweetId]);

  const handleLike = async (id) => {
    try {
      const res = await put(`/tweets/like/${id}`);
      if (res.success) {
        fetchTweetAndComments();
      }
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  };

  const handleBookmark = async (tweetId) => {
    try {
      const res = await put(`/tweets/bookmark/${tweetId}`);
      if (res.success) {
        fetchTweetAndComments();
      }
    } catch (error) {
      console.error("Error Bookmarking tweet:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return; // avoid empty comments
    setLoading(true);
    try {
      await post("/comments/create", {
        text: newComment,
        tweet: tweetId,
      });
      setNewComment("");
      await fetchTweetAndComments(); // refresh comments & tweet data
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!tweet)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0f1419]">
        <ClipLoader color="#ffffff" size={50} />
      </div>
    );

  const isLiked = tweet.likes.includes(user._id);
  const isBookmarked = tweet.bookmarks?.includes(user._id);

  return (
    <div className="bg-[#0f1419] min-h-screen p-4 text-white">
      <Tweet
        tweet={tweet}
        isLiked={isLiked}
        handleLike={handleLike}
        isBookmarked={isBookmarked}
        handleBookmark={handleBookmark}
        commentCount={comments.length}
      />

      {/* Add Comment Box */}
      <div className="mt-6 mb-4 flex items-center gap-2">
        <textarea
          rows={1}
          placeholder="Write a comment..."
          className="flex-grow p-2 rounded bg-[#1c1c1c] text-white border border-gray-600 resize-none"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
          className={`p-2 rounded ${
            loading || !newComment.trim()
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
          } text-white flex items-center justify-center`}
          aria-label="Post comment"
        >
          {loading ? (
            <ClipLoader color="#ffffff" size={20} />
          ) : (
            <FiSend size={20} />
          )}
        </button>
      </div>

      <h3 className="mt-6 mb-2 text-lg font-bold">Comments</h3>
      <div className="space-y-4">
        {comments.map((c) => (
          <Comment key={c._id} comment={c} />
        ))}
      </div>
    </div>
  );
};

export default TweetPage;
