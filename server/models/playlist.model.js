import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    name: {
      type: String,
      required: [true, "Please provide a name for your playlist."],
      trim: true,
      lowercase: true,
      maxLength: [50, "Playlist name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      maxLength: [500, "Bio cannot exceed 500 characters"],
      trim: true,
      default: "",
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE", "UNLISTED"],
      default: "PRIVATE",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Playlist = mongoose.model("Playlist", PlaylistSchema);
