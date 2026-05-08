import type { RequestHandler } from "express";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(httpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`));
};
