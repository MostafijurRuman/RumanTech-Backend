import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { prisma } from "@/app/utils/prisma";

export const wishlistService = {
  async add(userId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null, isPublished: true },
    });
    if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");

    return prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
      include: { product: { include: { category: true, brand: true } } },
    });
  },

  async get(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { category: true, brand: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async remove(userId: string, productId: string) {
    await prisma.wishlist.deleteMany({ where: { userId, productId } });
    return null;
  },
};
