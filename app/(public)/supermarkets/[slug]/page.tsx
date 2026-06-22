import type { Metadata } from "next";
import { Clock3, MapPin, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { StorefrontProducts } from "@/features/catalog/components/storefront-products";
import { SupermarketRating } from "@/features/engagement";
import { formatCurrency } from "@/lib/formatters";
import { getSupermarketBySlug, listProducts } from "@/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const supermarket = await getSupermarketBySlug((await params).slug);
  if (!supermarket) return {};
  return {
    title: supermarket.name,
    description: supermarket.description,
    alternates: { canonical: `/supermarkets/${supermarket.slug}` },
  };
}

export default async function SupermarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supermarket = await getSupermarketBySlug((await params).slug);
  if (!supermarket) notFound();
  const storeProducts = await listProducts({ supermarketId: supermarket.id });

  return (
    <div>
      <section className="relative min-h-64 overflow-hidden text-white" style={{ background: supermarket.coverUrl ?? undefined }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="marketplace-container relative flex min-h-64 items-end py-8">
          <div className="flex min-w-0 items-end gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white text-2xl font-black text-primary shadow-xl sm:size-20 sm:text-3xl">
              {supermarket.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white/75">Supermarket</p>
              <h1 className="break-words text-3xl font-black md:text-5xl">{supermarket.name}</h1>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center gap-1"><Clock3 className="size-4" /> {supermarket.deliveryTime}</span>
                <span className="flex items-center gap-1"><Truck className="size-4" /> {formatCurrency(supermarket.deliveryFee ?? 0)}</span>
                <span className="flex items-center gap-1"><MapPin className="size-4" /> Freetown</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="marketplace-container py-8">
        <StorefrontProducts products={storeProducts} />
        <SupermarketRating supermarket={supermarket} />
      </div>
    </div>
  );
}
