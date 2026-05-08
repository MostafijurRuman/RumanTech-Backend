import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { prisma } from "@/app/utils/prisma";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/app/modules/auth/auth.interface";
import {
  createAccessToken,
  createPasswordResetToken,
  createRefreshToken,
  hashPasswordResetToken,
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

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
  },

  async changePassword(userId: string, payload: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.deletedAt || !user.isActive) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user");
    }

    const passwordMatched = await verifyPassword(payload.oldPassword, user.passwordHash);

    if (!passwordMatched) {
      throw new AppError(httpStatus.BAD_REQUEST, "Old password is incorrect");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await hashPassword(payload.newPassword),
        passwordChangedAt: new Date(),
      },
    });

    return null;
  },

  async forgotPassword(payload: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user || user.deletedAt || !user.isActive) {
      return { resetToken: null };
    }

    const { rawToken, hashedToken } = createPasswordResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return { resetToken: rawToken };
  },

  async resetPassword(payload: ResetPasswordInput) {
    const hashedToken = hashPasswordResetToken(payload.token);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetAt: { gt: new Date() },
        deletedAt: null,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "Reset token is invalid or expired");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(payload.newPassword),
        passwordResetToken: null,
        passwordResetAt: null,
        passwordChangedAt: new Date(),
      },
    });

    return null;
  },
};
