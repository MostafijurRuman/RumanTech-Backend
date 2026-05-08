import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "@/app/config/env";

const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

export const corsOptions = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});

export const securityHeaders = helmet();

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
