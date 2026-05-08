import { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/app/utils/prisma";
import { monthKey } from "@/app/modules/dashboard/dashboard.utils";

const paidDeliveredWhere: Prisma.OrderWhereInput = {
  deletedAt: null,
  paymentStatus: PaymentStatus.PAID,
  status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
};

export const dashboardService = {
  async getAdminOverview() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyRevenue,
      previousMonthlyRevenue,
      recentOrders,
    ] = await prisma.$transaction([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null, status: OrderStatus.PENDING } }),
      prisma.order.aggregate({ where: paidDeliveredWhere, _sum: { total: true } }),
      prisma.order.aggregate({
        where: { ...paidDeliveredWhere, createdAt: { gte: monthStart } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { ...paidDeliveredWhere, createdAt: { gte: previousMonthStart, lt: monthStart } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    const current = Number(monthlyRevenue._sum?.total ?? 0);
    const previous = Number(previousMonthlyRevenue._sum?.total ?? 0);
    const salesGrowth = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

    return {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum?.total ?? 0),
        monthlyRevenue: current,
        salesGrowth,
        pendingOrders,
      },
      recentOrders,
    };
  },

  async getUserOverview(userId: string) {
    const [totalOrders, wishlistItems, reviewsCount, recentOrders] = await prisma.$transaction([
      prisma.order.count({ where: { userId, deletedAt: null } }),
      prisma.wishlist.count({ where: { userId } }),
      prisma.review.count({ where: { userId, deletedAt: null } }),
      prisma.order.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { items: { include: { product: true } } },
      }),
    ]);

    return { stats: { totalOrders, wishlistItems, reviewsCount }, recentOrders };
  },

  async getRevenueSeries(months = 12) {
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1), 1);
    start.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { ...paidDeliveredWhere, createdAt: { gte: start } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    });

    const bucket = new Map<string, { month: string; revenue: number; orders: number }>();
    for (let i = months - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - i, 1);
      const key = monthKey(date);
      bucket.set(key, { month: key, revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      const key = monthKey(order.createdAt);
      const item = bucket.get(key);
      if (item) {
        item.revenue += Number(order.total);
        item.orders += 1;
      }
    });

    return [...bucket.values()];
  },
};
