import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    watchProgress: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

HistorySchema.index({ user: 1, video: 1 }, { unique: true });

export const WatchHistory = mongoose.model("WatchHistory", HistorySchema);
