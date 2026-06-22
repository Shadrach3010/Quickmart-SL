import { EmptyState } from "@/components/marketplace/empty-state";
import { ProductCard } from "@/components/marketplace/product-card";
import type { Product } from "@/types";

export function WishlistView({ products }: { products: Product[] }) {
  if (!products.length) {
    return <EmptyState description="Products you save will appear here." title="Your wishlist is empty" />;
  }
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
