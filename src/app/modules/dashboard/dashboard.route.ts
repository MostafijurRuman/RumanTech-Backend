import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { dashboardController } from "@/app/modules/dashboard/dashboard.controller";

const router = Router();

router.use(authenticate);
router.get("/me", dashboardController.userOverview);
router.get("/admin", authorize(UserRole.ADMIN), dashboardController.adminOverview);

export const dashboardRoutes = router;
