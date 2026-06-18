import mongoose from "mongoose";

const TweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: [2000, "Tweet cannot exceed 2000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    image: {
      type: String,
      default: "",
    },
    commentCounts: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

TweetSchema.index({ createdAt: -1 });

export const Tweet = mongoose.model("Tweet", TweetSchema);
