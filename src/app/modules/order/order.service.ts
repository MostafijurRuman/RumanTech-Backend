import { NotificationType, OrderStatus, PaymentStatus, Prisma, UserRole } from "@/generated/prisma/client";
import { QueryBuilder } from "@/app/builders/QueryBuilder";
import { httpStatus } from "@/app/constants/http-status";
import { AppError } from "@/app/errors/AppError";
import { prisma } from "@/app/utils/prisma";

type OrderItemInput = { productId: string; quantity: number };

type CreateOrderInput = {
  items?: OrderItemInput[];
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  deliveryFee?: number;
  discount?: number;
};

export const orderService = {
  async create(userId: string, payload: CreateOrderInput) {
    const items =
      payload.items?.length
        ? payload.items
        : (await prisma.cart.findMany({ where: { userId } })).map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));

    if (!items.length) throw new AppError(httpStatus.BAD_REQUEST, "Order items are required");

    return prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((item) => item.productId) }, deletedAt: null, isPublished: true },
      });

      if (products.length !== items.length) {
        throw new AppError(httpStatus.BAD_REQUEST, "One or more products are unavailable");
      }

      let subtotal = new Prisma.Decimal(0);
      const orderItems = items.map((item) => {
        const product = products.find((current) => current.id === item.productId)!;
        if (product.stock < item.quantity) {
          throw new AppError(httpStatus.BAD_REQUEST, `${product.name} has insufficient stock`);
        }

        const total = product.price.mul(item.quantity);
        subtotal = subtotal.add(total);

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          total,
        };
      });

      const deliveryFee = new Prisma.Decimal(payload.deliveryFee ?? 0);
      const discount = new Prisma.Decimal(payload.discount ?? 0);
      const total = subtotal.add(deliveryFee).sub(discount);

      const order = await tx.order.create({
        data: {
          userId,
          subtotal,
          deliveryFee,
          discount,
          total,
          shippingName: payload.shippingName,
          shippingPhone: payload.shippingPhone,
          shippingLine1: payload.shippingLine1,
          shippingLine2: payload.shippingLine2,
          shippingCity: payload.shippingCity,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      const admins = await tx.user.findMany({
        where: { role: UserRole.ADMIN, isActive: true, deletedAt: null },
        select: { id: true },
      });

      if (admins.length) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "New order received",
            message: `${payload.shippingName} placed order #${order.id.slice(0, 8)} for BDT ${total.toFixed(2)}.`,
            type: NotificationType.ORDER,
            href: "/admin/orders",
          })),
        });
      }

      await tx.notification.create({
        data: {
          userId,
          title: "Order placed",
          message: `Your order #${order.id.slice(0, 8)} was placed successfully.`,
          type: NotificationType.ORDER,
          href: "/dashboard/orders",
        },
      });

      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );
      await tx.cart.deleteMany({ where: { userId } });

      return order;
    });
  },

  async getMyOrders(userId: string, query: Record<string, unknown>) {
    const builder = new QueryBuilder(query);
    const { page, limit, skip } = builder.pagination();
    const where = { userId, deletedAt: null };

    const [data, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: builder.sort(),
        include: { items: { include: { product: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    return { data, meta: builder.meta(total, page, limit) };
  },

  async getAll(query: Record<string, unknown>) {
    const builder = new QueryBuilder(query);
    const { page, limit, skip } = builder.pagination();
    const status = query.status ? (query.status as OrderStatus) : undefined;
    const paymentStatus = query.paymentStatus ? (query.paymentStatus as PaymentStatus) : undefined;
    const where = { deletedAt: null, status, paymentStatus };

    const [data, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: builder.sort(),
        include: { user: { select: { id: true, name: true, email: true } }, items: true },
      }),
      prisma.order.count({ where }),
    ]);

    return { data, meta: builder.meta(total, page, limit) };
  },

  async getSingle(orderId: string, userId?: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null, ...(userId ? { userId } : {}) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    return order;
  },

  async updateStatus(orderId: string, payload: { status?: OrderStatus; paymentStatus?: PaymentStatus }) {
    await this.getSingle(orderId);

    return prisma.order.update({
      where: { id: orderId },
      data: payload,
      include: { items: true },
    });
  },
};
