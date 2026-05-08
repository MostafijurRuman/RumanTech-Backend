import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { wishlistService } from "@/app/modules/wishlist/wishlist.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const wishlistController = {
  add: catchAsync(async (req, res) => {
    const result = await wishlistService.add(req.user!.id, req.body.productId);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Added to wishlist", data: result });
  }),
  get: catchAsync(async (req, res) => {
    const result = await wishlistService.get(req.user!.id);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Wishlist retrieved", data: result });
  }),
  remove: catchAsync(async (req, res) => {
    await wishlistService.remove(req.user!.id, String(req.params.productId));
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Removed from wishlist" });
  }),
};
