import type { UserRole } from "@/generated/prisma/client";

export type JwtPayload = {
  id: string;
  email: string;
  role: UserRole;
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
