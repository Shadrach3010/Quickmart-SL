import { Suspense } from "react";
import { OrdersView } from "@/features/orders/components/orders-view";

export default function OrdersPage() {
  return (
    <div className="marketplace-container py-8 md:py-12">
      <h1 className="text-3xl font-black tracking-tight md:text-5xl">Your orders</h1>
      <p className="mb-7 mt-2 text-muted-foreground">Track deliveries and revisit past shops.</p>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-muted" />}>
        <OrdersView />
      </Suspense>
    </div>
  );
}
