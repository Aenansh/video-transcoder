import dotenv from "dotenv"
dotenv.config({path: ".env.local"})

const env = {
  mongo_uri: process.env.DATABASE_URL,
};

export default env;