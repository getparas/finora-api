import express from "express";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import { initDB } from "./config/db.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") job.start();

// Middleware to parse incoming requests
app.use(rateLimiter); // Apply rate limiting middleware
app.use(express.json()); // To parse JSON bodies

const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is healthy" });
});

app.use("/api/transactions", transactionsRoute);

// Start the server and initialize the database
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("🚀 Server is up & running on PORT:", PORT);
  });
});
