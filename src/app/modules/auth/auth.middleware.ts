import type { RequestHandler } from "express";
import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { prisma } from "@/app/utils/prisma";
import {
  accessTokenCookieName,
  verifyAccessToken,
} from "@/app/modules/auth/auth.utils";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : undefined;
  const token = bearerToken ?? req.cookies?.[accessTokenCookieName];

  if (!token) {
    next(new AppError(httpStatus.UNAUTHORIZED, "Authentication required"));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        email: decoded.email,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        passwordChangedAt: true,
      },
    });

    if (!user) {
      next(new AppError(httpStatus.UNAUTHORIZED, "User no longer exists"));
      return;
    }

    if (user.passwordChangedAt && decoded.iat) {
      const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (changedAt > decoded.iat) {
        next(new AppError(httpStatus.UNAUTHORIZED, "Password changed after token was issued"));
        return;
      }
    }

    req.user = { id: user.id, email: user.email, role: user.role };
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
