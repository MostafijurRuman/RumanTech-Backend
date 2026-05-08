import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { categoryService } from "@/app/modules/category/category.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const categoryController = {
  create: catchAsync(async (req, res) => {
    const result = await categoryService.create(req.body, req.file);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category created successfully",
      data: result,
    });
  }),

  getAll: catchAsync(async (req, res) => {
    const result = await categoryService.getAll(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),

  getSingle: catchAsync(async (req, res) => {
    const result = await categoryService.getSingle(String(req.params.id));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category retrieved successfully",
      data: result,
    });
  }),

  update: catchAsync(async (req, res) => {
    const result = await categoryService.update(String(req.params.id), req.body, req.file);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category updated successfully",
      data: result,
    });
  }),

  delete: catchAsync(async (req, res) => {
    await categoryService.softDelete(String(req.params.id));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully",
    });
  }),
};
