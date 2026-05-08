import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { analyticsService } from "@/app/modules/analytics/analytics.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const analyticsController = {
  summary: catchAsync(async (req, res) => {
    const months = req.query.months ? Number(req.query.months) : 12;
    const result = await analyticsService.getSummary(months);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Analytics retrieved", data: result });
  }),
};
