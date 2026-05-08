import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { upload } from "@/app/middlewares/upload";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { brandController } from "@/app/modules/brand/brand.controller";
import { brandValidation } from "@/app/modules/brand/brand.validation";

const router = Router();

router.get("/", brandController.getAll);
router.get("/:id", brandController.getSingle);
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("image"),
  validateRequest(brandValidation.create),
  brandController.create
);
router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("image"),
  validateRequest(brandValidation.update),
  brandController.update
);
router.delete("/:id", authenticate, authorize(UserRole.ADMIN), brandController.delete);

export const brandRoutes = router;
