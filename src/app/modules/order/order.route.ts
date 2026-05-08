import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { orderController } from "@/app/modules/order/order.controller";
import { orderValidation } from "@/app/modules/order/order.validation";

const router = Router();

router.use(authenticate);
router.post("/", validateRequest(orderValidation.create), orderController.create);
router.get("/my-orders", orderController.myOrders);
router.get("/", authorize(UserRole.ADMIN), orderController.getAll);
router.get("/:id", orderController.getSingle);
router.patch(
  "/:id/status",
  authorize(UserRole.ADMIN),
  validateRequest(orderValidation.updateStatus),
  orderController.updateStatus
);

export const orderRoutes = router;
