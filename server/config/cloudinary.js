import { v2 as cloudinary } from "cloudinary";
import env from "../utils/env.js";
import fs from "fs";

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(filePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);

    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

export default uploadCloudinary;
