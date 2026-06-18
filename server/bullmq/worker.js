import { Worker } from "bullmq";
import env from "../utils/env.js";
import { VideoEvent } from "../models/event.model.js";
import path from "path";
import fs from "fs";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import s3 from "../config/tigris.js";
import { pipeline } from "stream/promises";
import { spawn } from "child_process";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import crypto from "node:crypto";
globalThis.crypto = crypto;

mongoose
  .connect(env.mongo_uri)
  .then(() => console.log("Worker successfully connected to MongoDB"))
  .catch((err) => console.error("Worker MongoDB Connection Error:", err));

const VIDEO_DIR = path.resolve("./videos");
const OUTPUTS_DIR = path.join(VIDEO_DIR, "outputs");

const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
};

const transcodingWorker = new Worker(
  "transcoding_queue",
  async (job) => {
    const { videoId, rawFileKey } = job.data;
    const filename = path.basename(rawFileKey);
    const localFilePath = path.join(VIDEO_DIR, filename);

    console.log("ID:", job.id, "name:", job.name, ":", job.data);
    console.log(`[Job ${job.id}] Started processing: ${filename}`);
    try {
      await VideoEvent.create({
        videoId,
        eventType: "TRANSCODING_STARTED",
        payload: { videoId, rawFileKey },
      });

      console.log(`[Job ${job.id}] Downloading raw file`);
      const downloadCommand = new GetObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: rawFileKey,
      });

      const { Body } = await s3.send(downloadCommand);
      await pipeline(Body, fs.createWriteStream(localFilePath));

      await new Promise((resolve, reject) => {
        console.log(`[Job ${job.id}] Spawning transcode.sh`);
        const scriptPath = path.join(process.cwd(), "transcoder.sh");
        const transcodeProcess = spawn(scriptPath, [filename]);

        transcodeProcess.stderr.on("data", (data) => {
          console.log(`[FFmpeg] ${data.toString().trim()}`);
        });
        transcodeProcess.on("close", (code) => {
          if (code == 0) resolve();
          else reject(new Error(`FFmpeg crashed with exit code ${code}`));
        });
      });

      console.log(`[Job ${job.id}] Uploading HLS segments to Tigris`);
      const allFiles = getAllFiles(OUTPUTS_DIR);

      for (const filePath of allFiles) {
        const fileStream = fs.createReadStream(filePath);

        const relativePath = path
          .relative(OUTPUTS_DIR, filePath)
          .replace(/\\/g, "/");

        const uploadCommand = new PutObjectCommand({
          Bucket: env.BUCKET_NAME,
          Key: `processed-videos/${videoId}/${relativePath}`,
          Body: fileStream,
          ContentType: filePath.endsWith(".m3u8")
            ? "application/x-mpegURL"
            : "video/MP2T",
        });
        await s3.send(uploadCommand);
      }

      console.log(`[Job ${job.id}] Cleaning up raw cloud files`);

      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.BUCKET_NAME,
          Key: rawFileKey,
        }),
      );

      fs.rmSync(localFilePath, { force: true });
      fs.rmSync(OUTPUTS_DIR, { recursive: true, force: true });

      const finalStreamUrl = `https://${env.BUCKET_NAME}.fly.storage.tigris.dev/processed-videos/${videoId}/master.m3u8`;

      await VideoEvent.create({
        videoId,
        eventType: "TRANSCODING_COMPLETED",
        payload: { streamUrl: finalStreamUrl },
      });

      await Video.findByIdAndUpdate(videoId, {
        isPublished: true,
        file: finalStreamUrl,
        status: "READY",
      });

      console.log(`[Job ${job.id}] Processing complete!`);

      await VideoEvent.create({
        videoId,
        eventType: "TRANSCODING_COMPLETED",
        payload: { streamUrl: finalStreamUrl },
      });

      console.log(`[Job ${job.id}] Video Published!`);
      return "Success";
    } catch (error) {
      console.error(`[Job ${job.id}] Failed:`, error);

      await VideoEvent.create({
        videoId,
        eventType: "TRANSCODING_FAILED",
        payload: { error: error.message },
      });

      await Video.findByIdAndUpdate(videoId, { status: "FAILED" });
      throw error;
    }
  },
  {
    connection: {
      port: env.REDIS_PORT,
      host: env.REDIS_HOST,
    },
    concurrency: 2,
  },
);

transcodingWorker.on("error", (job, error) => {
  console.log(`Worker failed job ${job.id}: ${error.message}`);
});
