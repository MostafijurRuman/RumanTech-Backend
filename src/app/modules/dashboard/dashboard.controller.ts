import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { dashboardService } from "@/app/modules/dashboard/dashboard.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const dashboardController = {
  adminOverview: catchAsync(async (_req, res) => {
    const result = await dashboardService.getAdminOverview();
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Admin dashboard retrieved", data: result });
  }),

  userOverview: catchAsync(async (req, res) => {
    const result =
      req.user!.role === UserRole.ADMIN
        ? await dashboardService.getAdminOverview()
        : await dashboardService.getUserOverview(req.user!.id);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Dashboard retrieved", data: result });
  }),
};
