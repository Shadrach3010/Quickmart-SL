import { WishlistView } from "@/features/engagement";
import { listWishlistProducts } from "@/services/engagement";

export default async function WishlistPage() {
  const products = await listWishlistProducts();
  return <div className="marketplace-container py-8 md:py-12"><h1 className="text-3xl font-black tracking-tight md:text-5xl">Your wishlist</h1><p className="mb-7 mt-2 text-muted-foreground">Your saved grocery favourites in one place.</p><WishlistView products={products} /></div>;
}
