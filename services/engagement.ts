import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listProducts } from "@/services/catalog";
import type { MarketplaceNotification, Product, ProductReview } from "@/types";

export async function listProductReviews(productId: string): Promise<ProductReview[]> {
  const client = await getSupabaseServerClient();
  const rows = await client.request<Array<{
    id: string;
    product_id: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_verified_purchase: boolean;
    created_at: string;
  }>>(
    `/rest/v1/product_reviews?product_id=eq.${encodeURIComponent(productId)}&is_approved=eq.true&select=id,product_id,rating,title,body,is_verified_purchase,created_at&order=created_at.desc`,
    { cache: "no-store" },
  );
  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    author: "QuickMart customer",
    rating: row.rating,
    title: row.title ?? "Product review",
    body: row.body ?? "",
    verifiedPurchase: row.is_verified_purchase,
    createdAt: row.created_at,
  }));
}

export async function listWishlistProducts(): Promise<Product[]> {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const client = await getSupabaseServerClient();
  const favorites = await client.request<Array<{ product_id: string }>>(
    `/rest/v1/favorites?profile_id=eq.${profile.id}&select=product_id&order=created_at.desc`,
    { cache: "no-store" },
  );
  const ids = new Set(favorites.map((item) => item.product_id));
  return (await listProducts()).filter((product) => ids.has(product.id));
}

export async function listNotifications(): Promise<MarketplaceNotification[]> {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const client = await getSupabaseServerClient();
  const rows = await client.request<Array<{
    id: string;
    type: MarketplaceNotification["type"];
    title: string;
    body: string;
    data: { href?: string };
    read_at: string | null;
    created_at: string;
  }>>(
    `/rest/v1/notifications?profile_id=eq.${profile.id}&select=id,type,title,body,data,read_at,created_at&order=created_at.desc`,
    { cache: "no-store" },
  );
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.data?.href ?? null,
    read: Boolean(row.read_at),
    createdAt: row.created_at,
  }));
}
