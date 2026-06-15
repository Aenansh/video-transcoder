import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  },
  { timestamps: true },
);

export const Video = mongoose.model("Video", VideoSchema);
