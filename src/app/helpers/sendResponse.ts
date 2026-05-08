import type { Response } from "express";
import type { ApiResponse } from "@/app/interfaces/api-response.interface";

export function sendResponse<T>(res: Response, payload: ApiResponse<T>) {
  const { statusCode, success, message, data, meta } = payload;

  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
}
