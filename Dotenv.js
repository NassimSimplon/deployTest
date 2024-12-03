//DotEnv
const dotenv = require("dotenv");
const result = dotenv.config();

if (result.error) {
  throw new Error("Failed to load .env file");
}

const requiredVars = ["PORT", "DB_USER", "DB_PASSWORD","CORS_ORIGIN","NODE_ENV","JWT_SECRET"];
requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = process.env;
