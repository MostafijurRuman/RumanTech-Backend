import { Router } from "express";
import { UserRole } from "@/generated/prisma/client";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { upload } from "@/app/middlewares/upload";
import { authenticate, authorize } from "@/app/modules/auth/auth.middleware";
import { userController } from "@/app/modules/user/user.controller";
import { userValidation } from "@/app/modules/user/user.validation";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getProfile);
router.patch("/me", validateRequest(userValidation.updateProfile), userController.updateProfile);
router.post("/me/avatar", upload.single("image"), userController.uploadProfileImage);
router.post("/me/addresses", validateRequest(userValidation.createAddress), userController.createAddress);
router.patch(
  "/me/addresses/:id",
  validateRequest(userValidation.updateAddress),
  userController.updateAddress
);
router.delete("/me/addresses/:id", userController.deleteAddress);

router.get("/", authorize(UserRole.ADMIN), userController.getUsers);
router.patch("/:id/role", authorize(UserRole.ADMIN), validateRequest(userValidation.updateRole), userController.updateRole);
router.patch("/:id/status", authorize(UserRole.ADMIN), validateRequest(userValidation.updateStatus), userController.updateStatus);
router.delete("/:id", authorize(UserRole.ADMIN), userController.deleteUser);

export const userRoutes = router;
