import { z } from "zod";

export const cartValidation = {
  add: z.object({
    body: z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).default(1),
    }),
  }),

  update: z.object({
    body: z.object({
      quantity: z.number().int().min(1),
    }),
  }),
};
