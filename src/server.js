import express from "express";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import { initDB } from "./config/db.js";
import job from "./config/cron.js";
import logger from "./config/logger.js";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") job.start();

app.use(rateLimiter);
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is healthy" });
});

app.use("/api/transactions", transactionsRoute);

app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

initDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is up & running on PORT: ${PORT}`);
  });
});
