import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { orderService } from "@/app/modules/order/order.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const orderController = {
  create: catchAsync(async (req, res) => {
    const result = await orderService.create(req.user!.id, req.body);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Order created", data: result });
  }),
  myOrders: catchAsync(async (req, res) => {
    const result = await orderService.getMyOrders(req.user!.id, req.query);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Orders retrieved", data: result.data, meta: result.meta });
  }),
  getAll: catchAsync(async (req, res) => {
    const result = await orderService.getAll(req.query);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Orders retrieved", data: result.data, meta: result.meta });
  }),
  getSingle: catchAsync(async (req, res) => {
    const result = await orderService.getSingle(
      String(req.params.id),
      req.user!.role === UserRole.ADMIN ? undefined : req.user!.id
    );
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Order retrieved", data: result });
  }),
  updateStatus: catchAsync(async (req, res) => {
    const result = await orderService.updateStatus(String(req.params.id), req.body);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Order status updated", data: result });
  }),
};
