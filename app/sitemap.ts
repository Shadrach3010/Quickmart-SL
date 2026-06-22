import type { MetadataRoute } from "next";
import { listProducts, listSupermarkets } from "@/services/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickmart-sl.vercel.app";
  const [products, supermarkets] = await Promise.all([listProducts(), listSupermarkets()]);
  const staticRoutes = ["", "/supermarkets", "/cart", "/sign-in", "/sign-up"];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.8 })),
    ...supermarkets.map((store) => ({ url: `${base}/supermarkets/${store.slug}`, lastModified: store.updatedAt, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
