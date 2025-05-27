import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Rate limiter error:", error);
    next(error); // Pass the error to the next middleware
  }
};
export default rateLimiter;
