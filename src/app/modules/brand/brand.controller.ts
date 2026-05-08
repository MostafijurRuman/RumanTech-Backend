import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { brandService } from "@/app/modules/brand/brand.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const brandController = {
  create: catchAsync(async (req, res) => {
    const result = await brandService.create(req.body, req.file);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Brand created successfully",
      data: result,
    });
  }),

  getAll: catchAsync(async (req, res) => {
    const result = await brandService.getAll(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Brands retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),

  getSingle: catchAsync(async (req, res) => {
    const result = await brandService.getSingle(String(req.params.id));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Brand retrieved successfully",
      data: result,
    });
  }),

  update: catchAsync(async (req, res) => {
    const result = await brandService.update(String(req.params.id), req.body, req.file);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Brand updated successfully",
      data: result,
    });
  }),

  delete: catchAsync(async (req, res) => {
    await brandService.softDelete(String(req.params.id));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Brand deleted successfully",
    });
  }),
};
