import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide the user name."],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9_]{3,16}$/,
        "Please fill a valid username (3-16 characters, alphanumeric or underscore only).",
      ],
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
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", UserSchema);