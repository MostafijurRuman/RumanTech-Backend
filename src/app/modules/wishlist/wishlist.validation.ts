import { z } from "zod";

export const wishlistValidation = {
  add: z.object({
    body: z.object({
      productId: z.string().uuid(),
    }),
  }),
};
