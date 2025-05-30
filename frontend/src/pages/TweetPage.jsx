import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tweet from "../components/Tweet";
import Comment from "../components/Comment";
import { get, put } from "../services/endpoints"; // include `put`
import useAuthStore from "../store/authStore";
import ClipLoader from "react-spinners/ClipLoader";

const TweetPage = () => {
  const { user } = useAuthStore();
  const { id: tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);

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
      await put(`/tweets/like/${id}`);
      fetchTweetAndComments(); // Refresh data after like/dislike
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  };

  if (!tweet)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0f1419]">
        <ClipLoader color="#ffffff" size={50} />
      </div>
    );

  const isLiked = tweet.likes.includes(user._id);

  return (
    <div className="bg-[#0f1419] min-h-screen p-4 text-white">
      <Tweet
        tweet={tweet}
        isLiked={isLiked}
        handleLike={handleLike}
        commentCount={comments.length}
      />

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
