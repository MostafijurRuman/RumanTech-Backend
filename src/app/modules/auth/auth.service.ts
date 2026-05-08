import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { prisma } from "@/app/utils/prisma";
import type { LoginInput, RegisterInput } from "@/app/modules/auth/auth.interface";
import {
  createAccessToken,
  createRefreshToken,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from "@/app/modules/auth/auth.utils";

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export const authService = {
  async register(payload: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser && !existingUser.deletedAt) {
      throw new AppError(httpStatus.CONFLICT, "Email is already registered");
    }

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash: await hashPassword(payload.password),
        role: UserRole.USER,
      },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: sanitizeUser(user),
      accessToken: createAccessToken(tokenPayload),
      refreshToken: createRefreshToken(tokenPayload),
    };
  },

  async login(payload: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user || user.deletedAt || !user.isActive) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    const passwordMatched = await verifyPassword(payload.password, user.passwordHash);

    if (!passwordMatched) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: sanitizeUser(user),
      accessToken: createAccessToken(tokenPayload),
      refreshToken: createRefreshToken(tokenPayload),
    };
  },

  async refreshToken(token: string | undefined) {
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.deletedAt || !user.isActive) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: sanitizeUser(user),
      accessToken: createAccessToken(tokenPayload),
    };
  },
};
