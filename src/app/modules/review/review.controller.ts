import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { reviewService } from "@/app/modules/review/review.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const reviewController = {
  create: catchAsync(async (req, res) => {
    const result = await reviewService.create(req.user!.id, req.body);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Review saved", data: result });
  }),
  getProductReviews: catchAsync(async (req, res) => {
    const result = await reviewService.getProductReviews(String(req.params.productId));
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Reviews retrieved", data: result });
  }),
  update: catchAsync(async (req, res) => {
    const result = await reviewService.update(req.user!.id, String(req.params.id), req.body);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Review updated", data: result });
  }),
  delete: catchAsync(async (req, res) => {
    await reviewService.delete(req.user!.id, String(req.params.id), req.user!.role === UserRole.ADMIN);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Review deleted" });
  }),
};
