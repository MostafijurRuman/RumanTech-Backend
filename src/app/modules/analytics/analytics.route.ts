import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { analyticsController } from "@/app/modules/analytics/analytics.controller";
import { analyticsValidation } from "@/app/modules/analytics/analytics.validation";

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));
router.get("/summary", validateRequest(analyticsValidation.list), analyticsController.summary);

export const analyticsRoutes = router;
