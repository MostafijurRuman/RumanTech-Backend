import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { upload } from "@/app/middlewares/upload";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { categoryController } from "@/app/modules/category/category.controller";
import { categoryValidation } from "@/app/modules/category/category.validation";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getSingle);
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("image"),
  validateRequest(categoryValidation.create),
  categoryController.create
);
router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("image"),
  validateRequest(categoryValidation.update),
  categoryController.update
);
router.delete("/:id", authenticate, authorize(UserRole.ADMIN), categoryController.delete);

export const categoryRoutes = router;
