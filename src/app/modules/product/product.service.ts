import { Prisma } from "@/generated/prisma/client";
import { QueryBuilder } from "@/app/builders/QueryBuilder";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import type { ProductImage, ProductInput } from "@/app/modules/product/product.interface";
import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/app/utils/cloudinary";
import { prisma } from "@/app/utils/prisma";
import { slugify } from "@/app/utils/slugify";

async function uploadProductImages(files?: Express.Multer.File[]) {
  if (!files?.length) return [];

  const uploads = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file, "rumantech/products"))
  );

  return uploads.map((upload) => ({
    url: upload.secure_url,
    publicId: upload.public_id,
  }));
}

function buildProductWhere(query: Record<string, unknown>): Prisma.ProductWhereInput {
  const searchTerm = String(query.searchTerm ?? "").trim();
  const category = String(query.category ?? "").trim();
  const brand = String(query.brand ?? "").trim();
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  const rating = query.rating ? Number(query.rating) : undefined;

  return {
    deletedAt: null,
    isPublished: query.includeDrafts === "true" ? undefined : true,
    ...(searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { sku: { contains: searchTerm, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category
      ? {
          OR: [{ categoryId: category }, { category: { slug: category } }],
        }
      : {}),
    ...(brand ? { OR: [{ brandId: brand }, { brand: { slug: brand } }] } : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        }
      : {}),
    ...(rating ? { avgRating: { gte: rating } } : {}),
  };
}

export const productService = {
  async create(payload: ProductInput, files?: Express.Multer.File[]) {
    const images = await uploadProductImages(files);

    return prisma.product.create({
      data: {
        ...payload,
        slug: slugify(payload.name),
        price: new Prisma.Decimal(payload.price),
        images: images as Prisma.InputJsonValue,
        specs: (payload.specs ?? {}) as Prisma.InputJsonValue,
      },
      include: { category: true, brand: true },
    });
  },

  async getAll(query: Record<string, unknown>) {
    const builder = new QueryBuilder(query);
    const where = buildProductWhere(query);
    const { page, limit, skip } = builder.pagination();

    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: builder.sort("createdAt"),
        include: {
          category: true,
          brand: true,
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, meta: builder.meta(total, page, limit) };
  },

  async getSingle(idOrSlug: string, includeDraft = false) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        deletedAt: null,
        isPublished: includeDraft ? undefined : true,
      },
      include: {
        category: true,
        brand: true,
        reviews: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, name: true, profileImageUrl: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    return product;
  },

  async update(id: string, payload: Partial<ProductInput>, files?: Express.Multer.File[]) {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    const newImages = await uploadProductImages(files);
    if (newImages.length) {
      const oldImages = product.images as ProductImage[];
      await Promise.all(oldImages.map((image) => deleteCloudinaryImage(image.publicId)));
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...payload,
        slug: payload.name ? slugify(payload.name) : undefined,
        price: payload.price ? new Prisma.Decimal(payload.price) : undefined,
        images: newImages.length ? (newImages as Prisma.InputJsonValue) : undefined,
        specs: payload.specs as Prisma.InputJsonValue | undefined,
      },
      include: { category: true, brand: true },
    });
  },

  async softDelete(id: string) {
    await this.getSingle(id, true);

    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
  },
};
