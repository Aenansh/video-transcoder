import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";

//Routers
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js"
import env from "./utils/env.js";

dotenv.config({ path: "./.env.local" });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  credentials: true,
  origin: '*'
}))

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);

const PORT = env.port;

app.listen(PORT, () => {
  connectDB();
  console.log(`Publisher server is running on http://localhost:${PORT}`);
});
