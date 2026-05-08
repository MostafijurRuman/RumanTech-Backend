import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  brand?: string;
  sku: string;
  weight?: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  images: string[];
  thumbnail?: string;
};

type DummyResponse = {
  products: DummyProduct[];
};

const categoryMap: Record<string, { name: string; description: string }> = {
  smartphones: {
    name: "Smartphones",
    description: "Flagship, mid-range, and budget smartphones for everyday use.",
  },
  laptops: {
    name: "Laptops",
    description: "Portable computers for work, gaming, study, and creative workflows.",
  },
  tablets: {
    name: "Tablets",
    description: "Touch-first tablets for media, productivity, and learning.",
  },
  "mobile-accessories": {
    name: "Mobile Accessories",
    description: "Chargers, power banks, cases, and accessories for mobile devices.",
  },
};

const categoriesToFetch = Object.keys(categoryMap);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function fetchCategoryProducts(category: string) {
  const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=12`);

  if (!response.ok) {
    throw new Error(`Failed to fetch category ${category}: ${response.status}`);
  }

  const data = (await response.json()) as DummyResponse;
  return data.products;
}

function buildImages(product: DummyProduct) {
  const uniqueImages = Array.from(new Set([product.thumbnail, ...product.images].filter(Boolean)));

  return uniqueImages.slice(0, 6).map((url, index) => ({
    url,
    publicId: `dummyjson/${product.id}/${index + 1}`,
  })) satisfies Prisma.InputJsonValue;
}

function buildSpecs(product: DummyProduct) {
  return {
    source: "DummyJSON",
    sourceId: product.id,
    warranty: product.warrantyInformation ?? "Standard warranty",
    shipping: product.shippingInformation ?? "Standard shipping",
    availability: product.availabilityStatus ?? "In Stock",
    returnPolicy: product.returnPolicy ?? "7 days return policy",
    minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
    weight: product.weight ? `${product.weight} kg` : undefined,
    dimensions: product.dimensions,
  } satisfies Prisma.InputJsonValue;
}

async function seedProducts() {
  const allProducts = (await Promise.all(categoriesToFetch.map(fetchCategoryProducts))).flat();

  for (const product of allProducts) {
    const categoryInfo = categoryMap[product.category] ?? {
      name: product.category,
      description: `${product.category} products.`,
    };
    const categorySlug = slugify(categoryInfo.name);
    const brandName = product.brand?.trim() || "RumanTech Select";
    const brandSlug = slugify(brandName);
    const productSlug = `${slugify(product.title)}-${product.id}`;

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {
        name: categoryInfo.name,
        description: categoryInfo.description,
        imageUrl: product.thumbnail,
        imageId: `dummyjson/category/${categorySlug}`,
        deletedAt: null,
      },
      create: {
        name: categoryInfo.name,
        slug: categorySlug,
        description: categoryInfo.description,
        imageUrl: product.thumbnail,
        imageId: `dummyjson/category/${categorySlug}`,
      },
    });

    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: {
        name: brandName,
        description: `${brandName} products available at RumanTech.`,
        imageUrl: product.thumbnail,
        imageId: `dummyjson/brand/${brandSlug}`,
        deletedAt: null,
      },
      create: {
        name: brandName,
        slug: brandSlug,
        description: `${brandName} products available at RumanTech.`,
        imageUrl: product.thumbnail,
        imageId: `dummyjson/brand/${brandSlug}`,
      },
    });

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.title,
        slug: productSlug,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        stock: Math.max(product.stock, 0),
        images: buildImages(product),
        specs: buildSpecs(product),
        avgRating: product.rating,
        reviewCount: 0,
        isFeatured: product.rating >= 4.2,
        isPublished: true,
        deletedAt: null,
        categoryId: category.id,
        brandId: brand.id,
      },
      create: {
        name: product.title,
        slug: productSlug,
        description: product.description,
        sku: product.sku,
        price: new Prisma.Decimal(product.price),
        stock: Math.max(product.stock, 0),
        images: buildImages(product),
        specs: buildSpecs(product),
        avgRating: product.rating,
        reviewCount: 0,
        isFeatured: product.rating >= 4.2,
        isPublished: true,
        categoryId: category.id,
        brandId: brand.id,
      },
    });
  }

  const [categoryCount, brandCount, productCount] = await Promise.all([
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.brand.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isPublished: true } }),
  ]);

  console.log(
    `Seed complete: ${categoryCount} categories, ${brandCount} brands, ${productCount} published products.`
  );
}

seedProducts()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
