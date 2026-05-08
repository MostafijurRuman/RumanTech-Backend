import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { prisma } from "@/app/utils/prisma";

export const cartService = {
  async add(userId: string, productId: string, quantity: number) {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null, isPublished: true },
    });

    if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    if (product.stock < quantity) throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock");

    return prisma.cart.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId, productId, quantity },
      include: { product: { include: { category: true, brand: true } } },
    });
  },

  async get(userId: string) {
    return prisma.cart.findMany({
      where: { userId },
      include: { product: { include: { category: true, brand: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(userId: string, cartId: string, quantity: number) {
    const item = await prisma.cart.findFirst({ where: { id: cartId, userId } });
    if (!item) throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");

    return prisma.cart.update({
      where: { id: cartId },
      data: { quantity },
      include: { product: true },
    });
  },

  async remove(userId: string, cartId: string) {
    const item = await prisma.cart.findFirst({ where: { id: cartId, userId } });
    if (!item) throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
    await prisma.cart.delete({ where: { id: cartId } });
    return null;
  },

  async clear(userId: string) {
    await prisma.cart.deleteMany({ where: { userId } });
    return null;
  },
};
