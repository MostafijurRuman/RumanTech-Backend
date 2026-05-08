import { Router } from "express";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { authenticate } from "@/app/modules/auth/auth.middleware";
import { cartController } from "@/app/modules/cart/cart.controller";
import { cartValidation } from "@/app/modules/cart/cart.validation";

const router = Router();

router.use(authenticate);
router.post("/", validateRequest(cartValidation.add), cartController.add);
router.get("/", cartController.get);
router.patch("/:id", validateRequest(cartValidation.update), cartController.update);
router.delete("/:id", cartController.remove);
router.delete("/", cartController.clear);

export const cartRoutes = router;
