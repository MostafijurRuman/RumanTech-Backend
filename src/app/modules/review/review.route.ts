import { Router } from "express";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { authenticate } from "@/app/modules/auth/auth.middleware";
import { reviewController } from "@/app/modules/review/review.controller";
import { reviewValidation } from "@/app/modules/review/review.validation";

const router = Router();

router.get("/product/:productId", reviewController.getProductReviews);
router.post("/", authenticate, validateRequest(reviewValidation.create), reviewController.create);
router.patch("/:id", authenticate, validateRequest(reviewValidation.update), reviewController.update);
router.delete("/:id", authenticate, reviewController.delete);

export const reviewRoutes = router;
