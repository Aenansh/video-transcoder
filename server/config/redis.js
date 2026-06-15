import Redis from "ioredis";
import env from "../utils/env.js";

const redis = new Redis(env.REDIS_URL);

export default redis;
