import jwt from "jsonwebtoken";
import env from "../utils/env.js";
import { User } from "../models/user.model.js";

const verifyToken = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken)
      return res.status(400).json({ error: "User not authenticated." });

    const decodedToken = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken",
    );

    if (!user) return res.status(400).json({ error: "No user found!" });
    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: "This account has been suspended." });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      error:
        error.name === "TokenExpiredError"
          ? "Access token expired."
          : "Invalid access token.",
    });
  }
};

export { verifyToken };
