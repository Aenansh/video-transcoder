import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Video } from "../models/video.model.js";
import env from "../utils/env.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/tigris.js";
import { v4 } from "uuid";
import mongoose from "mongoose";
import { VideoEvent } from "../models/event.model.js";
import transcodingQueue from "../bullmq/producer.js";

const fetchVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isPublished: true }).sort({
      createdAt: -1,
    });
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
    const { id } = req.params;
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
    const { id } = req.params;
    const { status } = req.body;
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
    const { file, contentType, title, description, channelId, thumbnail } =
      req.body;
    if (
      !file ||
      !contentType ||
      !title ||
      !description ||
      !channelId ||
      !thumbnail
    )
      return res.status(400).json({ error: "No file data provided." });

    const uniqueKey = `raw-videos/${Date.now()}-${v4()}-${file.replace(/\s+/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    const videoId = new mongoose.Types.ObjectId();
    await VideoEvent.create({
      videoId,
      eventType: "VIDEO_UPLOAD_INITIATED",
      payload: {
        title,
        description,
        channelId,
        rawFileKey: uniqueKey,
      },
    });

    await Video.create({
      _id: videoId,
      title,
      description,
      channelId,
      file: uniqueKey,
      thumbnail,
      duration: 0,
      isPublished: false,
    });

    res.status(200).json({ uploadUrl, key: uniqueKey });
  } catch (error) {
    console.log("Error in sending signed url.", error);
    return res.status(500).json({ error: "Failed to generate presigned URL" });
  }
};

const processVideo = async (req, res) => {
  try {
    const { uniqueKey, videoId } = req.body;

    if (!uniqueKey || !videoId) {
      return res.status(400).json({ error: "Missing uniqueKey or videoId." });
    }

    await VideoEvent.create({
      videoId,
      eventType: "VIDEO_UPLOAD_CONFIRMED",
      payload: { rawFileKey: uniqueKey },
    });

    await transcodingQueue.add(
      "transcode_the_video",
      {
        rawFileKey: uniqueKey,
      },
      {
        attempts: 1,
      },
    );
    return res
      .status(200)
      .json({ message: "Video sent to processing queue successfully." });
  } catch (error) {
    console.log("Error in processing video.", error);
    return res.status(500).json({ error: "Failed to process video." });
  }
};

export {
  fetchVideos,
  fetchVideoById,
  updateVideo,
  sendPresignedUrl,
  processVideo,
};
