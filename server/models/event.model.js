import mongoose from "mongoose";

const VideoEventSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    eventType: {
      type: String,
      enum: [
        "VIDEO_UPLOAD_INITIATED",
        "VIDEO_UPLOAD_CONFIRMED",
        "TRANSCODING_STARTED",
        "TRANSCODING_COMPLETED",
        "TRANSCODING_FAILED",
      ],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const VideoEvent = mongoose.model("VideoEvent", VideoEventSchema);
