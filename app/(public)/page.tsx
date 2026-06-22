import { ArrowRight, MapPin, Search, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/marketplace/empty-state";
import { ProductCard } from "@/components/marketplace/product-card";
import { SectionHeading } from "@/components/marketplace/section-heading";
import { SupermarketCard } from "@/components/marketplace/supermarket-card";
import { buttonVariants } from "@/components/ui/button";
import { RecentlyViewed } from "@/components/marketplace/recently-viewed";
import { listCategories, listProducts, listSupermarkets } from "@/services/catalog";

const categoryIcons: Record<string, string> = {
  "fresh-produce": "🥬",
  "meat-seafood": "🥩",
  "dairy-eggs": "🥛",
  bakery: "🥖",
  pantry: "🫘",
  beverages: "🧃",
  frozen: "❄️",
  household: "🧼",
};

export default async function HomePage() {
  const [categories, products, supermarkets] = await Promise.all([
    listCategories(),
    listProducts({ limit: 12 }),
    listSupermarkets(),
  ]);
  const featured = products.filter((product) => product.badge || product.compareAtPrice).slice(0, 6);

  return (
    <>
      <section className="marketplace-container py-5 md:py-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#143d2a] px-5 py-10 text-white md:px-12 md:py-16">
          <div className="absolute -right-20 -top-24 size-80 rounded-full bg-[#2b8c5d]/50 blur-3xl" />
          <div className="absolute bottom-0 right-4 hidden select-none text-[13rem] leading-none opacity-90 md:block">🛍️</div>
          <div className="relative max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="size-3.5 text-[#ffd466]" /> Freetown&apos;s grocery marketplace
            </p>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Your groceries,<span className="block text-[#f7c859]">delivered today.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70 md:text-lg">
              Shop active supermarkets across Freetown and get everything your home needs without the traffic.
            </p>
            <form action="/supermarkets" className="mt-7 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-2xl">
              <Search className="ml-2 mt-3 size-5 shrink-0 text-muted-foreground" />
              <input aria-label="Search groceries and supermarkets" className="min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none" name="q" placeholder="Search supermarkets…" />
              <button className={buttonVariants({ size: "lg", className: "hidden sm:inline-flex" })} type="submit">Search</button>
            </form>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/65">
              <span className="flex items-center gap-1.5"><MapPin className="size-4" /> Across Freetown</span>
              <span className="flex items-center gap-1.5"><Truck className="size-4" /> Same-day delivery</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-4" /> Secure checkout</span>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="marketplace-container py-8">
          <SectionHeading title="Shop by category" />
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-8">
            {categories.map((category) => (
              <Link className="group flex min-w-28 flex-col items-center gap-3 rounded-2xl border bg-card p-4 text-center transition hover:-translate-y-1 hover:shadow-md" href={`/supermarkets?category=${category.id}`} key={category.id}>
                <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-3xl">{categoryIcons[category.slug] ?? "🛒"}</span>
                <span className="text-xs font-semibold leading-4">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="marketplace-container py-8">
        <SectionHeading description="Offers published by active supermarkets" href="/supermarkets?featured=true" title="Featured products" />
        {featured.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : <EmptyState description="Vendor-published offers will appear here." title="No featured products yet" />}
      </section>
      <RecentlyViewed />

      <section className="marketplace-container py-8">
        <SectionHeading description="Active stores available for delivery" href="/supermarkets" title="Featured supermarkets" />
        {supermarkets.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {supermarkets.map((supermarket) => <SupermarketCard key={supermarket.id} supermarket={supermarket} />)}
          </div>
        ) : <EmptyState description="Approved supermarkets will appear here." title="No active supermarkets yet" />}
      </section>

      <section className="marketplace-container py-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-[#f6d46b] p-7 text-[#35280b]">
            <p className="text-sm font-bold uppercase tracking-widest">Shop smarter</p>
            <h2 className="mt-2 max-w-xs text-3xl font-black">Browse pantry essentials</h2>
            <p className="mt-3 max-w-sm text-sm opacity-75">Compare staples from available supermarkets.</p>
            <Link className={buttonVariants({ className: "mt-6 bg-[#35280b] text-white hover:bg-[#35280b]/90" })} href="/supermarkets?category=pantry">Browse stores <ArrowRight /></Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-[#dbeee1] p-7 text-[#143d2a]">
            <p className="text-sm font-bold uppercase tracking-widest">Fresh picks</p>
            <h2 className="mt-2 max-w-xs text-3xl font-black">Find fresh produce</h2>
            <p className="mt-3 max-w-sm text-sm opacity-75">See live inventory published by local vendors.</p>
            <Link className={buttonVariants({ className: "mt-6" })} href="/supermarkets?category=fresh-produce">Browse fresh <ArrowRight /></Link>
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="marketplace-container py-8">
          <SectionHeading description="Recently published products from active stores" title="Available now" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}
    </>
  );
}
