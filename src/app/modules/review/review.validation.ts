import { z } from "zod";

export const reviewValidation = {
  create: z.object({
    body: z.object({
      productId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(1000).optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      rating: z.number().int().min(1).max(5).optional(),
      comment: z.string().max(1000).optional(),
    }),
  }),
};
