export type ProductImage = {
  url: string;
  publicId: string;
};

export type ProductInput = {
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  brandId: string;
  specs?: Record<string, unknown>;
  isFeatured?: boolean;
  isPublished?: boolean;
};
