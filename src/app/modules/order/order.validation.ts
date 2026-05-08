import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { z } from "zod";

export const orderValidation = {
  create: z.object({
    body: z.object({
      items: z
        .array(
          z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().min(1),
          })
        )
        .optional(),
      shippingName: z.string().min(2).max(80),
      shippingPhone: z.string().min(6).max(30),
      shippingLine1: z.string().min(3).max(160),
      shippingLine2: z.string().max(160).optional(),
      shippingCity: z.string().min(2).max(80),
      deliveryFee: z.number().min(0).optional(),
      discount: z.number().min(0).optional(),
    }),
  }),

  updateStatus: z.object({
    body: z.object({
      status: z.enum(OrderStatus).optional(),
      paymentStatus: z.enum(PaymentStatus).optional(),
    }),
  }),
};
