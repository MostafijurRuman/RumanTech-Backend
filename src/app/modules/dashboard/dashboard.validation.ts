import { z } from "zod";

export const dashboardValidation = {
  range: z.object({
    query: z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }).optional(),
  }),
};
