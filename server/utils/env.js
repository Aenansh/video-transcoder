import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const env = {
  mongo_uri: process.env.DATABASE_URL,
  port: process.env.PORT,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3,
  AWS_ENDPOINT_URL_IAM: process.env.AWS_ENDPOINT_URL_IAM,
  AWS_REGION: process.env.AWS_REGION,
  BUCKET_NAME: process.env.BUCKET_NAME,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_URL: process.env.REDIS_URL,
};

export default env;
