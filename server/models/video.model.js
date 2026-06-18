import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, "A video requires a title."],
    },
    description: {
      type: String,
      required: [true, "A description is needed for a video."],
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "READY", "FAILED"],
        message: "{VALUE} is not a valid video status.",
      },
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Video = mongoose.model("Video", VideoSchema);
