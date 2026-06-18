import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: [2000, "Comment cannot exceed 2000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      deafult: false,
    },
    isPinned: {
      type: Boolean,
      deafult: false,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

commentSchema.index({ video: 1, parent: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);
