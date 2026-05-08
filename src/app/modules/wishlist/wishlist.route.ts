import { Router } from "express";
import { validateRequest } from "@/app/middlewares/validateRequest";
import { authenticate } from "@/app/modules/auth/auth.middleware";
import { wishlistController } from "@/app/modules/wishlist/wishlist.controller";
import { wishlistValidation } from "@/app/modules/wishlist/wishlist.validation";

const router = Router();

router.use(authenticate);
router.post("/", validateRequest(wishlistValidation.add), wishlistController.add);
router.get("/", wishlistController.get);
router.delete("/:productId", wishlistController.remove);

export const wishlistRoutes = router;
