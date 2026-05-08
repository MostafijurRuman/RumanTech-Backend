import { NotificationType } from "@/generated/prisma/client";
import { z } from "zod";

export const notificationsValidation = {
  create: z.object({
    body: z.object({
      userId: z.uuid().optional(),
      title: z.string().min(2).max(120),
      message: z.string().min(2).max(500),
      type: z.enum(NotificationType).optional(),
      href: z.string().max(240).optional(),
    }),
  }),
};
