import { httpStatus } from "@/app/constants/http-status";
import { sendResponse } from "@/app/helpers/sendResponse";
import { catchAsync } from "@/app/utils/catchAsync";
import { authService } from "@/app/modules/auth/auth.service";
import {
  authCookieOptions,
  refreshTokenCookieName,
} from "@/app/modules/auth/auth.utils";

const setAuthCookies = (
  res: Parameters<typeof sendResponse>[0],
  tokens: { accessToken: string; refreshToken?: string }
) => {
  if (tokens.refreshToken) {
    res.cookie(refreshTokenCookieName, tokens.refreshToken, {
      ...authCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

export const authController = {
  register: catchAsync(async (req, res) => {
    const result = await authService.register(req.body);
    setAuthCookies(res, result);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Registration successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }),

  login: catchAsync(async (req, res) => {
    const result = await authService.login(req.body);
    setAuthCookies(res, result);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }),

  refreshToken: catchAsync(async (req, res) => {
    const result = await authService.refreshToken(req.cookies?.[refreshTokenCookieName]);
    setAuthCookies(res, { accessToken: result.accessToken });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Access token refreshed",
      data: result,
    });
  }),

  logout: catchAsync(async (_req, res) => {
    res.clearCookie(refreshTokenCookieName, authCookieOptions);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Logout successful",
    });
  }),

  me: catchAsync(async (req, res) => {
    const user = await authService.getCurrentUser(req.user!.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Authenticated user profile",
      data: user,
    });
  }),

  changePassword: catchAsync(async (req, res) => {
    await authService.changePassword(req.user!.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password changed successfully",
    });
  }),

  forgotPassword: catchAsync(async (req, res) => {
    const result = await authService.forgotPassword(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password reset instructions generated",
      data: result,
    });
  }),

  resetPassword: catchAsync(async (req, res) => {
    await authService.resetPassword(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password reset successful",
    });
  }),
};
