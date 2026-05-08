import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { notificationsService } from "@/app/modules/notifications/notifications.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const notificationsController = {
  create: catchAsync(async (req, res) => {
    const result = await notificationsService.create(req.body);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Notification created", data: result });
  }),

  myNotifications: catchAsync(async (req, res) => {
    const result = await notificationsService.getForUser(req.user!.id, req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Notifications retrieved",
      data: { items: result.data, unread: result.unread },
      meta: result.meta,
    });
  }),

  markAsRead: catchAsync(async (req, res) => {
    const result = await notificationsService.markAsRead(req.user!.id, String(req.params.id));
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Notification marked as read", data: result });
  }),

  markAllAsRead: catchAsync(async (req, res) => {
    await notificationsService.markAllAsRead(req.user!.id);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Notifications marked as read" });
  }),

  delete: catchAsync(async (req, res) => {
    await notificationsService.delete(req.user!.id, String(req.params.id));
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Notification deleted" });
  }),
};
