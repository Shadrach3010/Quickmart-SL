import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/marketplace/add-to-cart-button";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ProductImage } from "@/components/marketplace/product-image";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col rounded-2xl border bg-card p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <FavoriteButton className="absolute right-5 top-5 z-10" productId={product.id} />
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <ProductImage
            alt={product.name}
            className="size-full transition duration-300 group-hover:scale-105"
            src={product.imageUrls[0]}
          />
          {product.badge && (
            <Badge className="absolute left-2 top-2 bg-white/90 text-primary shadow-sm">{product.badge}</Badge>
          )}
        </div>
        <div className="pt-3">
          <p className="text-xs text-muted-foreground">{product.supermarketName}</p>
          <h3 className="mt-1 line-clamp-2 min-h-10 font-semibold leading-5">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{product.unit}</p>
        </div>
      </Link>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <div>
          <p className="font-black">{formatCurrency(product.price)}</p>
          {product.compareAtPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice)}
            </p>
          )}
        </div>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
