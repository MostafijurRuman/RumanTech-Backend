import { QueryBuilder } from "@/app/builders/QueryBuilder";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import type { CreateNotificationInput } from "@/app/modules/notifications/notifications.interface";
import { prisma } from "@/app/utils/prisma";

export const notificationsService = {
  async create(payload: CreateNotificationInput) {
    return prisma.notification.create({ data: payload });
  },

  async getForUser(userId: string, query: Record<string, unknown>) {
    const builder = new QueryBuilder(query);
    const { page, limit, skip } = builder.pagination();
    const where = { OR: [{ userId }, { userId: null }] };

    const [data, total, unread] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, readAt: null } }),
    ]);

    return { data, unread, meta: builder.meta(total, page, limit) };
  },

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, OR: [{ userId }, { userId: null }] },
    });
    if (!notification) throw new AppError(httpStatus.NOT_FOUND, "Notification not found");

    return prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: notification.readAt ?? new Date() },
    });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { OR: [{ userId }, { userId: null }], readAt: null },
      data: { readAt: new Date() },
    });
    return null;
  },

  async delete(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, OR: [{ userId }, { userId: null }] },
    });
    if (!notification) throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
    if (!notification.userId) throw new AppError(httpStatus.FORBIDDEN, "System notifications cannot be deleted");

    await prisma.notification.delete({ where: { id: notificationId } });
    return null;
  },
};
