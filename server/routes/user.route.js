import { Router } from "express";
import {
  signInUser,
  signUpUser,
  signOutUser,
  // refreshAccessToken,
  // updatePassword,
  // updateAvatar,
  // updateCoverImage,
  // updateUserDetails,
  // currentUser,
  // getChannels,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/sign-up").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  signUpUser,
);
router.route("/sign-in").post(signInUser);
router.route("/sign-out").post(verifyToken, signOutUser);

// router.route("/refresh-token").post(refreshAccessToken);
// router.route("/update-password").put(verifyToken, updatePassword);

// router
//   .route("/update-avatar")
//   .patch(verifyToken, upload.single("avatar"), updateAvatar);
// router
//   .route("/update-cover-image")
//   .patch(verifyToken, upload.single("coverImage"), updateCoverImage);

// router.route("/update-details").patch(verifyToken, updateUserDetails);

// router.route("/current-user").get(verifyToken, currentUser);
// router.route("/channel/:username").get(getUserChannel);

export default router;
