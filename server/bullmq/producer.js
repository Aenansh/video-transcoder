import { Queue } from "bullmq";
import env from "../utils/env.js";

const transcodingQueue = new Queue("transcoding_queue", {
  connection: {
    port: env.REDIS_PORT,
    host: env.REDIS_HOST,
  },
});

export default transcodingQueue;
