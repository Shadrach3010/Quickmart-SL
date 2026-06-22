"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store";
import type { Product } from "@/types";

export function AddToCartButton({
  product,
  className,
  quantity = 1,
}: {
  product: Product;
  className?: string;
  quantity?: number;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  return (
    <Button
      aria-label={`Add ${product.name} to cart`}
      className={className}
      onClick={() => {
        const result = addItem({
          productId: product.id,
          vendorId: product.vendorId,
          name: product.name,
          unitPrice: product.price,
          quantity,
          imageUrl: product.imageUrls[0] ?? null,
          slug: product.slug,
          supermarketName: product.supermarketName,
        });
        if (!result) {
          toast.error("Clear your current supermarket cart before adding products from another store.");
          return;
        }
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      size="icon"
    >
      {added ? <Check /> : <Plus />}
    </Button>
  );
}
