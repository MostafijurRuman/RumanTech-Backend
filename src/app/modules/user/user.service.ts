import { UserRole } from "@/generated/prisma/client";
import { QueryBuilder } from "@/app/builders/QueryBuilder";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import type { AddressInput, UpdateProfileInput } from "@/app/modules/user/user.interface";
import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/app/utils/cloudinary";
import { prisma } from "@/app/utils/prisma";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  profileImageUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export const userService = {
  async getUsers(query: Record<string, unknown>) {
    const builder = new QueryBuilder(query, ["name", "email"], { deletedAt: null });
    const where = builder.buildSearch();
    const { page, limit, skip } = builder.pagination();

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip,
        take: limit,
        orderBy: builder.sort(),
      }),
      prisma.user.count({ where }),
    ]);

    return { data, meta: builder.meta(total, page, limit) };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        ...userSelect,
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
    }

    return user;
  },

  async updateProfile(userId: string, payload: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: payload,
      select: userSelect,
    });
  },

  async uploadProfileImage(userId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new AppError(httpStatus.BAD_REQUEST, "Profile image is required");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const uploaded = await uploadBufferToCloudinary(file, "rumantech/users");
    await deleteCloudinaryImage(user.profileImageId);

    return prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl: uploaded.secure_url,
        profileImageId: uploaded.public_id,
      },
      select: userSelect,
    });
  },

  async createAddress(userId: string, payload: AddressInput) {
    return prisma.$transaction(async (tx) => {
      if (payload.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }

      return tx.address.create({
        data: {
          ...payload,
          userId,
        },
      });
    });
  },

  async updateAddress(userId: string, addressId: string, payload: Partial<AddressInput>) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) {
      throw new AppError(httpStatus.NOT_FOUND, "Address not found");
    }

    return prisma.$transaction(async (tx) => {
      if (payload.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }

      return tx.address.update({
        where: { id: addressId },
        data: payload,
      });
    });
  },

  async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) {
      throw new AppError(httpStatus.NOT_FOUND, "Address not found");
    }

    await prisma.address.delete({ where: { id: addressId } });
    return null;
  },

  async updateRole(userId: string, role: UserRole) {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: userSelect,
    });
  },

  async updateStatus(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: userSelect,
    });
  },

  async softDelete(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });
    return null;
  },
};
