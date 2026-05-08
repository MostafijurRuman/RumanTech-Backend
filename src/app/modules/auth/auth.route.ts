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

export const authRoutes = router;
