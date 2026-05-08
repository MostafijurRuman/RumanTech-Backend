import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { env } from "@/app/config/env";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { logger } from "@/app/utils/logger";

export const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let details: unknown = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation failed";
    details = error.flatten();
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = error.code === "P2002" ? httpStatus.CONFLICT : httpStatus.BAD_REQUEST;
    message = error.code === "P2002" ? "Duplicate resource" : "Database request failed";
    details = { code: error.code, meta: error.meta };
  } else if (error instanceof Error) {
    message = error.message;
  }

  logger.error(message, { error });

  res.status(statusCode).json({
    success: false,
    message,
    error: env.NODE_ENV === "production" ? undefined : details ?? error,
    stack: env.NODE_ENV === "production" ? undefined : error?.stack,
  });
};
