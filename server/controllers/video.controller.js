import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Video } from "../models/video.model.js";
import env from "../utils/env.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/tigris.js";
import { v4 } from "uuid";

const createVideo = async (req, res) => {
  try {
    const { title, description, file, thumbnail, channelId, duration } =
      req.body;
    if (!title || !description || !file || !thumbnail || !channelId)
      return res.status(400).json({ error: "All fields are required." });

    const newVideo = await Video.create({
      title,
      description,
      thumbnail,
      file,
      channelId,
      isPublished: false,
      duration,
      status: "PENDING",
    });

    if (!newVideo)
      return res.status(400).json({ error: "Couldn't create the video." });
  } catch (error) {
    console.log("Failed to create video", error);
    return res.status(500).json({ error: "Failed to create video." });
  }
};

const fetchVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    if (!videos || videos.length === 0)
      return res.status(400).json({ error: "No videos found." });

    return res.status(200).json(videos);
  } catch (error) {
    console.log("Failed to fetch videos.", error);
    return res.status(500).json({ error: "Failed to fetch videos." });
  }
};

const fetchVideoById = async (req, res) => {
  try {
    const { id } = req.body;
    const videos = await Video.findById(id);
    if (!videos) return res.status(400).json({ error: "No videos found." });

    return res.status(200).json(videos);
  } catch (error) {
    console.log("Failed to fetch video.", error);
    return res.status(500).json({ error: "Failed to fetch video." });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { id, status } = req.body;
    const video = await Video.findByIdAndUpdate(id, { status });

    if (!video)
      return res
        .status(400)
        .json({ error: "Video not found or couldn't update." });

    return res.status(201).json({ message: "Video updated.", video });
  } catch (error) {
    console.log("Failed to update video.", error);
    return res.status(500).json({ error: "Failed to update video." });
  }
};

const sendPresignedUrl = async (req, res) => {
  try {
    const { file, contentType } = req.body;
    if (!file || !contentType)
      return res.status(400).json({ error: "No file data provided." });

    const uniqueKey = `raw-videos/${Date.now()}-${file}/${v4()}`;

    const command = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    res.status(200).json({ uploadUrl, key: uniqueKey });
  } catch (error) {
    console.log("Error in sending signed url.", error);
    return res.status(500).json({ error: "Failed to generate presigned URL" });
  }
};

const processVideo = async (req, res) => {
  try {
    const { uniqueKey } = req.body;
    

  } catch (error) {
    console.log("Error in processing video.", error);
    return res.status(500).json({ error: "Failed to process video." });
  }
};

export {
  createVideo,
  fetchVideos,
  fetchVideoById,
  updateVideo,
  sendPresignedUrl,
  processVideo,
};
