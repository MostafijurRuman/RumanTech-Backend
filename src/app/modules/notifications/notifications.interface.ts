import type { NotificationType } from "@/generated/prisma/client";

export type CreateNotificationInput = {
  userId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  href?: string;
};
