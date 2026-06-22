"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/marketplace/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderTrackingTimeline } from "@/features/orders/components/order-tracking-timeline";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import type { OrderTrackingEvent } from "@/types";

type CustomerOrder = {
  id: string;
  orderNumber: string;
  store: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    created_at: string;
    status: string;
  }>;
};

const completedStatuses = new Set(["delivered", "cancelled", "refunded"]);

export function OrdersView() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"active" | "history">("active");
  const { data = [], isLoading, error } = useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: async () => {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to load orders.");
      return body.data as CustomerOrder[];
    },
  });
  const orders = data.filter((order) =>
    tab === "active" ? !completedStatuses.has(order.status) : completedStatuses.has(order.status),
  );
  const placedOrder = searchParams.get("order");

  return (
    <div>
      {searchParams.get("placed") === "true" && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-primary/20 bg-secondary p-4 text-primary" role="status">
          <CheckCircle2 className="shrink-0" />
          <div><p className="font-bold">Order {placedOrder ? `${placedOrder} ` : ""}placed successfully</p><p className="text-sm opacity-75">The supermarket has been notified.</p></div>
        </div>
      )}
      <div aria-label="Order view" className="mb-6 flex w-full rounded-xl bg-muted p-1 sm:w-fit" role="tablist">
        <Button className="flex-1 sm:flex-none" aria-selected={tab === "active"} onClick={() => setTab("active")} role="tab" variant={tab === "active" ? "default" : "ghost"}>Active orders</Button>
        <Button className="flex-1 sm:flex-none" aria-selected={tab === "history"} onClick={() => setTab("history")} role="tab" variant={tab === "history" ? "default" : "ghost"}>Order history</Button>
      </div>
      {isLoading ? (
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      ) : error ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive" role="alert">{error.message}</p>
      ) : orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const events: OrderTrackingEvent[] = order.events.map((event, index) => ({
              id: event.id,
              title: event.title,
              description: event.description ?? "",
              location: event.location ?? undefined,
              timestamp: formatDate(event.created_at, { dateStyle: "medium", timeStyle: "short" }),
              complete: true,
              current: index === order.events.length - 1 && !completedStatuses.has(order.status),
            }));
            return (
              <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6" key={order.id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words font-black">{order.store}</h2>
                      <Badge variant={completedStatuses.has(order.status) ? "secondary" : "default"}>{order.status.replaceAll("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 break-all text-xs text-muted-foreground">{order.orderNumber} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="sm:text-right"><p className="font-black">{formatCurrency(order.total)}</p><p className="text-xs text-muted-foreground">{order.items} items</p></div>
                </div>
                {events.length > 0 && <div className="my-6 border-t pt-6"><OrderTrackingTimeline events={events} /></div>}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState description={tab === "active" ? "You don't have an order on the way right now." : "Completed orders will appear here."} title={tab === "active" ? "No active orders" : "No order history"} />
      )}
    </div>
  );
}
