import { Router } from "express";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { authController } from "@/app/modules/auth/auth.controller";
import { authenticate } from "@/app/modules/auth/auth.middleware";
import { authValidation } from "@/app/modules/auth/auth.validation";

const router = Router();

router.post("/register", validateRequest(authValidation.register), authController.register);
router.post("/login", validateRequest(authValidation.login), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);
router.patch(
  "/change-password",
  authenticate,
  validateRequest(authValidation.changePassword),
  authController.changePassword
);
router.post(
  "/forgot-password",
  validateRequest(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validateRequest(authValidation.resetPassword),
  authController.resetPassword
);

export const authRoutes = router;
