import { z } from "zod";

export const analyticsValidation = {
  list: z.object({
    query: z.object({
      months: z.coerce.number().int().min(1).max(24).optional(),
    }).optional(),
  }),
};
