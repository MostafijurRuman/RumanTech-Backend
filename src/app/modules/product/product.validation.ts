import { z } from "zod";

const booleanLike = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

const numberLike = z.preprocess((value) => Number(value), z.number());

const specsLike = z.preprocess((value) => {
  if (typeof value === "string" && value.trim()) {
    return JSON.parse(value);
  }
  return value;
}, z.record(z.string(), z.unknown()).optional());

const productBody = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(10),
  sku: z.string().min(2).max(80),
  price: numberLike.pipe(z.number().positive()),
  stock: numberLike.pipe(z.number().int().min(0)),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid(),
  specs: specsLike,
  isFeatured: booleanLike.optional(),
  isPublished: booleanLike.optional(),
});

export const productValidation = {
  create: z.object({
    body: productBody,
  }),

  update: z.object({
    body: productBody.partial(),
  }),
};
