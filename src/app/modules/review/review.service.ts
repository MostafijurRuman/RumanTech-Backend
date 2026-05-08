import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { prisma } from "@/app/utils/prisma";

async function recalculateProductRating(productId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { productId, deletedAt: null },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count.rating,
    },
  });
}

export const reviewService = {
  async create(userId: string, payload: { productId: string; rating: number; comment?: string }) {
    const product = await prisma.product.findFirst({
      where: { id: payload.productId, deletedAt: null, isPublished: true },
    });
    if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId, productId: payload.productId } },
      update: { rating: payload.rating, comment: payload.comment, deletedAt: null },
      create: { ...payload, userId },
      include: { user: { select: { id: true, name: true, profileImageUrl: true } } },
    });

    await recalculateProductRating(payload.productId);
    return review;
  },

  async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId, deletedAt: null },
      include: { user: { select: { id: true, name: true, profileImageUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async getMyReviews(userId: string) {
    return prisma.review.findMany({
      where: { userId, deletedAt: null },
      include: { product: { select: { id: true, name: true, slug: true, images: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAll() {
    return prisma.review.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(userId: string, reviewId: string, payload: { rating?: number; comment?: string }) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, userId, deletedAt: null } });
    if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: payload,
      include: { user: { select: { id: true, name: true, profileImageUrl: true } } },
    });

    await recalculateProductRating(review.productId);
    return updated;
  },

  async delete(userId: string, reviewId: string, isAdmin: boolean) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null, ...(isAdmin ? {} : { userId }) },
    });
    if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");

    await prisma.review.update({ where: { id: reviewId }, data: { deletedAt: new Date() } });
    await recalculateProductRating(review.productId);
    return null;
  },
};
