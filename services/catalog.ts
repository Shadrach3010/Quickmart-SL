import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, Vendor } from "@/types";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

type StoreRow = {
  id: string;
  owner_profile_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  delivery_fee: number | string;
  estimated_delivery_minutes: number | null;
  created_at: string;
  updated_at: string;
};

type ProductRow = {
  id: string;
  supermarket_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  price: number | string;
  compare_at_price: number | string | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  supermarkets: { name: string };
  categories: { name: string } | null;
  product_images: Array<{ storage_path: string; is_primary: boolean; sort_order: number }>;
};

const storeGradients = [
  "linear-gradient(135deg,#145c3b 0%,#2a9965 55%,#f3c85a 100%)",
  "linear-gradient(135deg,#78261f 0%,#c65436 55%,#f5c26b 100%)",
  "linear-gradient(135deg,#173f74 0%,#3679a9 55%,#98d6dc 100%)",
  "linear-gradient(135deg,#5d321c 0%,#a76835 55%,#edc585 100%)",
  "linear-gradient(135deg,#563477 0%,#9b5dab 55%,#e3abd3 100%)",
];

function hash(value: string) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function mapStore(row: StoreRow): Vendor {
  return {
    id: row.id,
    ownerId: row.owner_profile_id ?? "",
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    coverUrl: row.cover_image_url ?? storeGradients[hash(row.id) % storeGradients.length],
    deliveryTime: row.estimated_delivery_minutes
      ? `${row.estimated_delivery_minutes} min`
      : "Delivery time confirmed at checkout",
    deliveryFee: Number(row.delivery_fee),
    rating: undefined,
    tags: [],
    isActive: true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProduct(
  row: ProductRow,
  storageUrl: (bucket: string, path: string) => string,
): Product {
  const images = [...(row.product_images ?? [])].sort(
    (left, right) => Number(right.is_primary) - Number(left.is_primary) || left.sort_order - right.sort_order,
  );
  return {
    id: row.id,
    vendorId: row.supermarket_id,
    categoryId: row.category_id ?? "",
    categoryName: row.categories?.name ?? "Other",
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    stockQuantity: row.stock_quantity,
    imageUrls: images.length
      ? images.map((image) => storageUrl("product-images", image.storage_path))
      : [],
    unit: row.unit,
    supermarketName: row.supermarkets.name,
    rating: 0,
    badge: row.is_featured ? "Featured" : null,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCategories(): Promise<CatalogCategory[]> {
  const client = await getSupabaseServerClient();
  return client.request<CatalogCategory[]>(
    "/rest/v1/categories?is_active=eq.true&select=id,name,slug,imageUrl:image_url&order=sort_order.asc,name.asc",
    { cache: "no-store" },
  );
}

export async function listSupermarkets(): Promise<Vendor[]> {
  const client = await getSupabaseServerClient();
  const rows = await client.request<StoreRow[]>(
    "/rest/v1/supermarkets?status=eq.active&select=id,owner_profile_id,name,slug,description,logo_url,cover_image_url,delivery_fee,estimated_delivery_minutes,created_at,updated_at&order=is_featured.desc,name.asc",
    { cache: "no-store" },
  );
  return rows.map(mapStore);
}

export async function getSupermarketBySlug(slug: string): Promise<Vendor | null> {
  const client = await getSupabaseServerClient();
  const rows = await client.request<StoreRow[]>(
    `/rest/v1/supermarkets?slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=id,owner_profile_id,name,slug,description,logo_url,cover_image_url,delivery_fee,estimated_delivery_minutes,created_at,updated_at&limit=1`,
    { cache: "no-store" },
  );
  return rows[0] ? mapStore(rows[0]) : null;
}

export async function listProducts(filters: {
  supermarketId?: string;
  categoryId?: string;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Product[]> {
  const client = await getSupabaseServerClient();
  const query = new URLSearchParams({
    is_active: "eq.true",
    select: "id,supermarket_id,category_id,name,slug,description,unit,price,compare_at_price,stock_quantity,is_active,is_featured,created_at,updated_at,supermarkets!inner(name,status),categories(name),product_images(storage_path,is_primary,sort_order)",
    order: "is_featured.desc,created_at.desc",
  });
  query.set("supermarkets.status", "eq.active");
  if (filters.supermarketId) query.set("supermarket_id", `eq.${filters.supermarketId}`);
  if (filters.categoryId) query.set("category_id", `eq.${filters.categoryId}`);
  if (filters.featured) query.set("is_featured", "eq.true");
  if (filters.limit) query.set("limit", String(filters.limit));
  const rows = await client.request<ProductRow[]>(`/rest/v1/products?${query}`, {
    cache: "no-store",
  });
  return rows.map((row) => mapProduct(row, client.storageUrl));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await listProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
