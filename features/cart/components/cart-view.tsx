"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/marketplace/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { formatCurrency } from "@/lib/formatters";
import { useCartStore } from "@/store";

export function CartView() {
  const mounted = useMounted();
  const { items, removeItem, setQuantity } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const estimatedDelivery = items.length ? 20 : 0;

  if (!mounted) {
    return <div className="h-96 animate-pulse rounded-3xl bg-muted" />;
  }

  if (!items.length) {
    return (
      <EmptyState
        description="Add groceries from any supermarket and they’ll show up here."
        title="Your cart is waiting"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_23rem]">
      <div className="space-y-3">
        {items.map((item) => (
          <article className="flex gap-4 rounded-2xl border bg-card p-4" key={item.productId}>
            <Link
              className="grid size-24 shrink-0 place-items-center rounded-xl bg-muted text-5xl"
              href={`/products/${item.slug}`}
            >
              {item.imageUrl}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{item.supermarketName}</p>
              <h2 className="mt-1 font-bold">{item.name}</h2>
              <p className="mt-1 font-black text-primary">{formatCurrency(item.unitPrice)}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center rounded-lg border">
                  <Button aria-label="Decrease quantity" onClick={() => setQuantity(item.productId, item.quantity - 1)} size="icon" variant="ghost"><Minus /></Button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <Button aria-label="Increase quantity" onClick={() => setQuantity(item.productId, item.quantity + 1)} size="icon" variant="ghost"><Plus /></Button>
                </div>
                <Button aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.productId)} size="icon" variant="ghost"><Trash2 className="text-destructive" /></Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-3xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
        <div className="flex items-center gap-2"><ShoppingBag className="text-primary" /><h2 className="text-lg font-black">Order summary</h2></div>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Estimated delivery</span><span>{formatCurrency(estimatedDelivery)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatCurrency(0)}</span></div>
        </div>
        <div className="my-5 border-t" />
        <div className="flex items-center justify-between text-lg font-black"><span>Total</span><span>{formatCurrency(subtotal + estimatedDelivery)}</span></div>
        <Link className={buttonVariants({ size: "lg", className: "mt-5 w-full rounded-xl" })} href="/checkout">
          Continue to checkout
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">Final delivery fees are confirmed at checkout.</p>
      </aside>
    </div>
  );
}
