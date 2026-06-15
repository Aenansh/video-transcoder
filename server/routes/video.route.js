import { Router } from "express";
import {
  createVideo,
  fetchVideoById,
  fetchVideos,
  processVideo,
  sendPresignedUrl,
  updateVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/").get(fetchVideos);
router.route("/:id").get(fetchVideoById).patch(updateVideo);
router.route("/get-presigned-url").post(sendPresignedUrl);
router.route("/upload-confirmation").post(processVideo);

export default router;
