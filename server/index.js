import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

//Routers
import userRouter from "./routes/user.route.js";

dotenv.config({ path: "./.env.local" });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Publisher server is running on http://localhost:${PORT}`);
});
