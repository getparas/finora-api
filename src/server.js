import express from "express";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import { initDB } from "./config/db.js";

dotenv.config();

const app = express();

// Middleware to parse incoming requests
app.use(rateLimiter); // Apply rate limiting middleware
app.use(express.json()); // To parse JSON bodies

const PORT = process.env.PORT || 5001;

app.use("/api/transactions", transactionsRoute);

// Start the server and initialize the database
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("🚀 Server is up & running on PORT:", PORT);
  });
});
