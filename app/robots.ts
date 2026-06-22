import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickmart-sl.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/vendor/", "/account/", "/checkout/", "/orders/", "/notifications/", "/wishlist/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
