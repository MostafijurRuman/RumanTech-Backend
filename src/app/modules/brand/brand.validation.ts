import { z } from "zod";

export const brandValidation = {
  create: z.object({
    body: z.object({
      name: z.string().min(2).max(80),
      description: z.string().max(500).optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(2).max(80).optional(),
      description: z.string().max(500).optional(),
    }),
  }),
};
