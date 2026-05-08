import { UserRole } from "@/generated/prisma/client";
import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { userService } from "@/app/modules/user/user.service";
import { catchAsync } from "@/app/utils/catchAsync";

export const userController = {
  getUsers: catchAsync(async (req, res) => {
    const result = await userService.getUsers(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),

  getProfile: catchAsync(async (req, res) => {
    const result = await userService.getProfile(req.user!.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile retrieved successfully",
      data: result,
    });
  }),

  updateProfile: catchAsync(async (req, res) => {
    const result = await userService.updateProfile(req.user!.id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data: result,
    });
  }),

  uploadProfileImage: catchAsync(async (req, res) => {
    const result = await userService.uploadProfileImage(req.user!.id, req.file);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile image uploaded successfully",
      data: result,
    });
  }),

  createAddress: catchAsync(async (req, res) => {
    const result = await userService.createAddress(req.user!.id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Address created successfully",
      data: result,
    });
  }),

  updateAddress: catchAsync(async (req, res) => {
    const result = await userService.updateAddress(req.user!.id, String(req.params.id), req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Address updated successfully",
      data: result,
    });
  }),

  deleteAddress: catchAsync(async (req, res) => {
    await userService.deleteAddress(req.user!.id, String(req.params.id));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Address deleted successfully",
    });
  }),

  updateRole: catchAsync(async (req, res) => {
    const result = await userService.updateRole(String(req.params.id), req.body.role as UserRole);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User role updated successfully",
      data: result,
    });
  }),

  updateStatus: catchAsync(async (req, res) => {
    const result = await userService.updateStatus(String(req.params.id), Boolean(req.body.isActive));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: result,
    });
  }),

  deleteUser: catchAsync(async (req, res) => {
    await userService.softDelete(String(req.params.id));
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully",
    });
  }),
};
