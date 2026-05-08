import { Router } from "express";
import { aiRoutes } from "@/app/modules/ai/ai.route";
import { analyticsRoutes } from "@/app/modules/analytics/analytics.route";
import { authRoutes } from "@/app/modules/auth/auth.route";
import { brandRoutes } from "@/app/modules/brand/brand.route";
import { cartRoutes } from "@/app/modules/cart/cart.route";
import { categoryRoutes } from "@/app/modules/category/category.route";
import { dashboardRoutes } from "@/app/modules/dashboard/dashboard.route";
import { notificationsRoutes } from "@/app/modules/notifications/notifications.route";
import { orderRoutes } from "@/app/modules/order/order.route";
import { productRoutes } from "@/app/modules/product/product.route";
import { reviewRoutes } from "@/app/modules/review/review.route";
import { userRoutes } from "@/app/modules/user/user.route";
import { wishlistRoutes } from "@/app/modules/wishlist/wishlist.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/products",
    route: productRoutes,
  },
  {
    path: "/categories",
    route: categoryRoutes,
  },
  {
    path: "/brands",
    route: brandRoutes,
  },
  {
    path: "/orders",
    route: orderRoutes,
  },
  {
    path: "/dashboard",
    route: dashboardRoutes,
  },
  {
    path: "/analytics",
    route: analyticsRoutes,
  },
  {
    path: "/notifications",
    route: notificationsRoutes,
  },
  {
    path: "/reviews",
    route: reviewRoutes,
  },
  {
    path: "/cart",
    route: cartRoutes,
  },
  {
    path: "/wishlist",
    route: wishlistRoutes,
  },
  {
    path: "/ai",
    route: aiRoutes,
  },
] as const;

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export const appRouter = router;
