import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../utils/env.js";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "Please provide the user name."],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9_]{3,16}$/,
        "Please fill a valid username (3-16 characters, alphanumeric or underscore only).",
      ],
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please provide your e-mail address."],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password to proceed."],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
        "Password must be 8-20 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      ],
    },
    fullName: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },
    bio: {
      type: String,
      maxLength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    avatar: {
      type: String,
      trim: true,
      required: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    subscribersCount: {
      type: Number,
      default: 0,
    },
    subscribedToCount: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY },
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY },
  );
};

export const User = mongoose.model("User", UserSchema);
