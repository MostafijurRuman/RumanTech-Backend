import { QueryBuilder } from "@/app/builders/QueryBuilder";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import type { BrandInput } from "@/app/modules/brand/brand.interface";
import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/app/utils/cloudinary";
import { prisma } from "@/app/utils/prisma";
import { slugify } from "@/app/utils/slugify";

export const brandService = {
  async create(payload: BrandInput, file?: Express.Multer.File) {
    const uploaded = file ? await uploadBufferToCloudinary(file, "rumantech/brands") : null;

    return prisma.brand.create({
      data: {
        ...payload,
        slug: slugify(payload.name),
        imageUrl: uploaded?.secure_url,
        imageId: uploaded?.public_id,
      },
    });
  },

  async getAll(query: Record<string, unknown>) {
    const builder = new QueryBuilder(query, ["name", "description"], { deletedAt: null });
    const where = builder.buildSearch();
    const { page, limit, skip } = builder.pagination();

    const [data, total] = await prisma.$transaction([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: builder.sort(),
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.count({ where }),
    ]);

    return { data, meta: builder.meta(total, page, limit) };
  },

  async getSingle(idOrSlug: string) {
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        deletedAt: null,
      },
      include: { _count: { select: { products: true } } },
    });

    if (!brand) {
      throw new AppError(httpStatus.NOT_FOUND, "Brand not found");
    }

    return brand;
  },

  async update(id: string, payload: Partial<BrandInput>, file?: Express.Multer.File) {
    const brand = await prisma.brand.findFirst({ where: { id, deletedAt: null } });
    if (!brand) {
      throw new AppError(httpStatus.NOT_FOUND, "Brand not found");
    }

    const uploaded = file ? await uploadBufferToCloudinary(file, "rumantech/brands") : null;
    if (uploaded) {
      await deleteCloudinaryImage(brand.imageId);
    }

    return prisma.brand.update({
      where: { id },
      data: {
        ...payload,
        slug: payload.name ? slugify(payload.name) : undefined,
        imageUrl: uploaded?.secure_url,
        imageId: uploaded?.public_id,
      },
    });
  },

  async softDelete(id: string) {
    await this.getSingle(id);

    return prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
