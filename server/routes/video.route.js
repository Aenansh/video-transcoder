import { Router } from "express";

const router = Router();

router.route("/").post(createVideo).get(fetchVideos);
router.route("/:id").get(fetchVideoById).put(updateVideo);
router.route("/get-presigned-url").post(sendPresignedUrl);
router.route("/upload-confirmation").post(processVideo);

export default router;