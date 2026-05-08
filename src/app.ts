import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import { env } from "@/app/config/env";
import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { globalErrorHandler } from "@/app/middlewares/globalErrorHandler";
import { notFound } from "@/app/middlewares/notFound";
import {
  apiRateLimiter,
  corsOptions,
  securityHeaders,
} from "@/app/middlewares/security";
import { appRouter } from "@/app/routes";
import { logger } from "@/app/utils/logger";

export const app = express();

app.use(securityHeaders);
app.use(corsOptions);
app.use(apiRateLimiter);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

app.get("/health", (_req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "RumanTech API is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/v1", appRouter);
app.use(notFound);
app.use(globalErrorHandler);
