import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { productService } from "@/app/modules/product/product.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const productController = {
  create: catchAsync(async (req, res) => {
    const result = await productService.create(req.body, req.files as Express.Multer.File[]);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Product created successfully",
      data: result,
    });
  }),

  getAll: catchAsync(async (req, res) => {
    const result = await productService.getAll(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),

  getSingle: catchAsync(async (req, res) => {
    const result = await productService.getSingle(String(req.params.id), req.query.includeDraft === "true");
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Product retrieved successfully",
      data: result,
    });
  }),

  update: catchAsync(async (req, res) => {
    const result = await productService.update(
      String(req.params.id),
      req.body,
      req.files as Express.Multer.File[]
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Product updated successfully",
      data: result,
    });
  }),

  delete: catchAsync(async (req, res) => {
    await productService.softDelete(String(req.params.id));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Product deleted successfully",
    });
  }),
};
