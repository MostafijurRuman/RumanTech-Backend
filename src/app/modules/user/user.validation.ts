import { z } from "zod";

const addressBody = z.object({
  label: z.string().max(40).optional(),
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(30),
  line1: z.string().min(3).max(160),
  line2: z.string().max(160).optional(),
  city: z.string().min(2).max(80),
  state: z.string().max(80).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(2).max(80).optional(),
  isDefault: z.boolean().optional(),
});

export const userValidation = {
  updateProfile: z.object({
    body: z.object({
      name: z.string().min(2).max(80).optional(),
      phone: z.string().min(6).max(30).optional(),
    }),
  }),

  createAddress: z.object({
    body: addressBody,
  }),

  updateAddress: z.object({
    body: addressBody.partial(),
  }),

  updateRole: z.object({
    body: z.object({
      role: z.enum(["ADMIN", "USER"]),
    }),
  }),

  updateStatus: z.object({
    body: z.object({
      isActive: z.boolean(),
    }),
  }),
};
