import { Router } from "express";
import { signInUser, signUpUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/sign-up").post(signUpUser);
router.route("/sign-in").post(signInUser);

export default router;
