"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/marketplace/product-card";
import { SectionHeading } from "@/components/marketplace/section-heading";
import type { Product } from "@/types";

export function RecentlyViewed() {
  const { data = [] } = useQuery({
    queryKey: ["recently-viewed"],
    queryFn: async () => {
      const response = await fetch("/api/recently-viewed", { cache: "no-store" });
      if (response.status === 401) return [] as Product[];
      if (!response.ok) throw new Error("Unable to load recently viewed products.");
      return (await response.json()).data as Product[];
    },
    staleTime: 30_000,
  });
  if (!data.length) return null;
  return (
    <section className="marketplace-container py-8">
      <SectionHeading description="Pick up where you left off" title="Recently viewed" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {data.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
