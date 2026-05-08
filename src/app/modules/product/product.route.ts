import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { upload } from "@/app/middlewares/upload";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { productController } from "@/app/modules/product/product.controller";
import { productValidation } from "@/app/modules/product/product.validation";

const router = Router();

router.get("/", productController.getAll);
router.get("/:id", productController.getSingle);
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.array("images", 8),
  validateRequest(productValidation.create),
  productController.create
);
router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.array("images", 8),
  validateRequest(productValidation.update),
  productController.update
);
router.delete("/:id", authenticate, authorize(UserRole.ADMIN), productController.delete);

export const productRoutes = router;
