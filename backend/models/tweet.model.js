import mongoose from "mongoose";

const TweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      maxlength: 280,
    },
    image: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    retweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TweetModel = mongoose.model("Tweet", TweetSchema);
export default TweetModel;
