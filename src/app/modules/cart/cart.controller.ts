import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { cartService } from "@/app/modules/cart/cart.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const cartController = {
  add: catchAsync(async (req, res) => {
    const result = await cartService.add(req.user!.id, req.body.productId, req.body.quantity);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Added to cart", data: result });
  }),
  get: catchAsync(async (req, res) => {
    const result = await cartService.get(req.user!.id);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Cart retrieved", data: result });
  }),
  update: catchAsync(async (req, res) => {
    const result = await cartService.update(req.user!.id, String(req.params.id), req.body.quantity);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Cart updated", data: result });
  }),
  remove: catchAsync(async (req, res) => {
    await cartService.remove(req.user!.id, String(req.params.id));
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Cart item removed" });
  }),
  clear: catchAsync(async (req, res) => {
    await cartService.clear(req.user!.id);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Cart cleared" });
  }),
};
