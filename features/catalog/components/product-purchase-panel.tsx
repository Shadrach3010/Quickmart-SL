"use client";

import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { useCartStore } from "@/store";
import type { Product } from "@/types";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    void fetch("/api/recently-viewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
  }, [product.id]);

  function addToCart() {
    const added = addItem({
      productId: product.id,
      vendorId: product.vendorId,
      name: product.name,
      unitPrice: product.price,
      quantity,
      imageUrl: product.imageUrls[0] ?? null,
      slug: product.slug,
      supermarketName: product.supermarketName,
    });
    if (!added) {
      toast.error("Your cart contains products from another supermarket. Clear it before switching stores.");
      return;
    }
    toast.success(`${product.name} added to your cart.`);
  }

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{product.supermarketName}</p>
        <FavoriteButton className="border" productId={product.id} />
      </div>
      <h1 className="mt-2 break-words text-3xl font-black tracking-tight md:text-4xl">{product.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {product.unit} · {product.stockQuantity > 0 ? `${product.stockQuantity} available` : "Out of stock"}
      </p>
      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-black text-primary">{formatCurrency(product.price)}</span>
        {product.compareAtPrice && <span className="text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>}
      </div>
      <p className="mt-5 leading-7 text-muted-foreground">{product.description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex w-fit items-center rounded-xl border bg-muted/40">
          <Button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} size="icon" variant="ghost"><Minus /></Button>
          <span className="w-9 text-center font-bold">{quantity}</span>
          <Button aria-label="Increase quantity" disabled={quantity >= product.stockQuantity} onClick={() => setQuantity((value) => Math.min(product.stockQuantity, value + 1))} size="icon" variant="ghost"><Plus /></Button>
        </div>
        <Button className="h-12 flex-1 rounded-xl" disabled={product.stockQuantity < 1} onClick={addToCart}>
          {product.stockQuantity < 1 ? "Out of stock" : `Add ${quantity} · ${formatCurrency(product.price * quantity)}`}
        </Button>
      </div>
      <div className="mt-6 grid gap-3 border-t pt-5 text-sm text-muted-foreground sm:grid-cols-2">
        <span className="flex items-center gap-2"><Truck className="size-4 text-primary" /> Same-day delivery</span>
        <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Quality checked</span>
      </div>
    </div>
  );
}
