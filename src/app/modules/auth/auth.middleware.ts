import type { RequestHandler } from "express";
import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import {
  accessTokenCookieName,
  verifyAccessToken,
} from "@/app/modules/auth/auth.utils";

export const authenticate: RequestHandler = (req, _res, next) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : undefined;
  const token = bearerToken ?? req.cookies?.[accessTokenCookieName];

  if (!token) {
    next(new AppError(httpStatus.UNAUTHORIZED, "Authentication required"));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(httpStatus.UNAUTHORIZED, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(httpStatus.FORBIDDEN, "You are not allowed to access this resource"));
      return;
    }

    next();
  };
}
