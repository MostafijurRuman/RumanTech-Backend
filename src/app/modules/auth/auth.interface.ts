import type { UserRole } from "@/generated/prisma/client";

export type JwtPayload = {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};
