import mongoose from "mongoose";
import env from "../utils/env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongo_uri);
    console.log("Connected to Database");
  } catch (error) {
    console.log("Failed to connect to database", error);
    process.exit(0);
  }
};
