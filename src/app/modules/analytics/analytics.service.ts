import { Prisma } from "@/generated/prisma/client";
import { dashboardService } from "@/app/modules/dashboard/dashboard.service";
import { prisma } from "@/app/utils/prisma";

export const analyticsService = {
  async getSummary(months = 12) {
    const [revenueTrends, orderStatus, paymentStatus, userGrowth, topProducts] = await Promise.all([
      dashboardService.getRevenueSeries(months),
      prisma.order.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ["paymentStatus"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ month: Date; users: bigint }[]>`
        SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS users
        FROM "User"
        WHERE "deletedAt" IS NULL
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT ${months}
      `,
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 8,
      }),
    ]);

    const products = await prisma.product.findMany({
      where: { id: { in: topProducts.map((item) => item.productId) } },
      select: { id: true, name: true },
    });

    return {
      revenueTrends,
      orderStatus: orderStatus.map((item) => ({ label: item.status, value: item._count._all })),
      paymentStatus: paymentStatus.map((item) => ({ label: item.paymentStatus, value: item._count._all })),
      userGrowth: userGrowth
        .reverse()
        .map((item) => ({ month: item.month.toISOString().slice(0, 7), users: Number(item.users) })),
      productPerformance: topProducts.map((item) => ({
        productId: item.productId,
        name: products.find((product) => product.id === item.productId)?.name ?? "Unknown product",
        quantity: item._sum.quantity ?? 0,
        revenue: Number(item._sum.total ?? new Prisma.Decimal(0)),
      })),
    };
  },
};
