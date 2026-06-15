import { Worker } from "bullmq";
import env from "../utils/env.js";

const transcodingWorker = new Worker("transcoding_queue", async (job) => {
  try {
    console.log()
  } catch (error) {
    
  }
}, {
  connection: {
    port: env.REDIS_PORT,
    host: env.REDIS_HOST,
  },
});
