import { QueryBuilder } from "@/app/builders/QueryBuilder";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import type { CategoryInput } from "@/app/modules/category/category.interface";
import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/app/utils/cloudinary";
import { prisma } from "@/app/utils/prisma";
import { slugify } from "@/app/utils/slugify";

export const categoryService = {
  async create(payload: CategoryInput, file?: Express.Multer.File) {
    const uploaded = file ? await uploadBufferToCloudinary(file, "rumantech/categories") : null;

    return prisma.category.create({
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
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: builder.sort(),
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.count({ where }),
    ]);

    return { data, meta: builder.meta(total, page, limit) };
  },

  async getSingle(idOrSlug: string) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        deletedAt: null,
      },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    return category;
  },

  async update(id: string, payload: Partial<CategoryInput>, file?: Express.Multer.File) {
    const category = await prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    const uploaded = file ? await uploadBufferToCloudinary(file, "rumantech/categories") : null;
    if (uploaded) {
      await deleteCloudinaryImage(category.imageId);
    }

    return prisma.category.update({
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

    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
