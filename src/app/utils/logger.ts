import winston from "winston";
import { env } from "@/app/config/env";

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "rumantech-api" },
  transports: [new winston.transports.Console()],
});
