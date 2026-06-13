import { Router } from "express";
import { signUpUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/sign-up").post(signUpUser);
router.route("/sign-in").post(signInUser);
router.route("/sign-out").post(signOutUser);
router.route("/current-user").get(getCurrentUser);

export default router;