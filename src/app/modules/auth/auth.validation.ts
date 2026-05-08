import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const authValidation = {
  register: z.object({
    body: z.object({
      name: z.string().min(2).max(80),
      email: z.string().email().toLowerCase(),
      password,
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email().toLowerCase(),
      password: z.string().min(1),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      oldPassword: z.string().min(1),
      newPassword: password,
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email().toLowerCase(),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(20),
      newPassword: password,
    }),
  }),
};
