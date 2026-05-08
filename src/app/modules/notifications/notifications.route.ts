import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { notificationsController } from "@/app/modules/notifications/notifications.controller";
import { notificationsValidation } from "@/app/modules/notifications/notifications.validation";

const router = Router();

router.use(authenticate);
router.get("/", notificationsController.myNotifications);
router.patch("/read-all", notificationsController.markAllAsRead);
router.patch("/:id/read", notificationsController.markAsRead);
router.delete("/:id", notificationsController.delete);
router.post("/", authorize(UserRole.ADMIN), validateRequest(notificationsValidation.create), notificationsController.create);

export const notificationsRoutes = router;
