import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    likeType: {
      type: String,
      required: true,
      enum: {
        values: ["LIKE", "DISLIKE"],
        message: "{VALUE} is not a valid reaction.",
      },
    },
  },
  { timestamps: true },
);

likeSchema.pre("validate", function (next) {
  const targetCount = [this.video, this.comment, this.tweet].filter(
    Boolean,
  ).length;

  if (targetCount !== 1) {
    next(
      new Error(
        "A reaction must target exactly one entity (video, comment, or tweet).",
      ),
    );
  } else {
    next();
  }
});

likeSchema.index(
  { likedBy: 1, video: 1 },
  { unique: true, partialFilterExpression: { video: { $exists: true } } },
);
likeSchema.index(
  { likedBy: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } },
);
likeSchema.index(
  { likedBy: 1, tweet: 1 },
  { unique: true, partialFilterExpression: { tweet: { $exists: true } } },
);

export const Like = mongoose.model("Like", likeSchema);
