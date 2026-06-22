"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Clock3, MapPin, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import type { OrderStatus, VendorOrder } from "@/types";

const filters = ["all", "pending", "confirmed", "preparing", "ready_for_pickup", "delivered"] as const;
const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: [],
  out_for_delivery: [],
};

async function loadOrders() {
  const response = await fetch("/api/vendor/orders");
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Unable to load orders.");
  return body.data as VendorOrder[];
}

export function OrdersManager({ initialOrders }: { initialOrders: VendorOrder[] }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [selected, setSelected] = useState<VendorOrder | null>(null);
  const { data = initialOrders } = useQuery({
    initialData: initialOrders,
    queryFn: loadOrders,
    queryKey: queryKeys.orders.all,
  });
  const mutation = useMutation({
    mutationFn: async ({
      order,
      status,
    }: {
      order: VendorOrder;
      status: OrderStatus;
    }) => {
      const response = await fetch(`/api/vendor/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to update order.");
      return body.data as VendorOrder;
    },
    onSuccess: (order) => {
      queryClient.setQueryData<VendorOrder[]>(
        queryKeys.orders.all,
        (current = []) =>
          current.map((item) => (item.id === order.id ? order : item)),
      );
      setSelected(order);
    },
  });
  const filtered = useMemo(
    () =>
      data.filter(
        (order) =>
          (filter === "all" || order.status === filter) &&
          `${order.orderNumber} ${order.customerName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data, filter, query],
  );

  return (
    <>
      <div className="mb-5 flex flex-col gap-3">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {filters.map((item) => (
            <Button
              key={item}
              onClick={() => setFilter(item)}
              variant={filter === item ? "default" : "outline"}
            >
              {item.replaceAll("_", " ")}
              {item === "pending" && (
                <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
                  {data.filter((order) => order.status === "pending").length}
                </span>
              )}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="h-10 bg-white pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number or customer"
            value={query}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow
                className="cursor-pointer"
                key={order.id}
                onClick={() => setSelected(order)}
              >
                <TableCell>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.deliveryArea}</p>
                </TableCell>
                <TableCell>{order.itemCount}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "cancelled" ? "destructive" : order.status === "delivered" ? "default" : "secondary"}>
                    {order.status.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="font-black">{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell><ChevronRight className="size-4 text-muted-foreground" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet onOpenChange={(open) => !open && setSelected(null)} open={Boolean(selected)}>
        <SheetContent className="w-full max-w-lg overflow-y-auto" side="right">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.orderNumber}</SheetTitle>
                <SheetDescription>
                  {formatDate(selected.createdAt, {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 grid gap-3 rounded-2xl bg-muted/60 p-4 text-sm">
                <p className="flex items-center gap-2"><UserRound className="size-4 text-primary" /><span><strong>{selected.customerName}</strong><br />{selected.customerPhone}</span></p>
                <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{selected.deliveryArea}, Freetown</p>
                <p className="flex items-center gap-2"><Clock3 className="size-4 text-primary" />Delivery requested today</p>
              </div>
              <div className="mt-6">
                <h3 className="font-black">Order items</h3>
                <div className="mt-3 divide-y rounded-2xl border">
                  {selected.items.map((item) => (
                    <div className="flex gap-3 p-3 text-sm" key={item.id}>
                      <span className="grid size-9 place-items-center rounded-lg bg-muted font-bold">{item.quantity}×</span>
                      <span className="flex-1 font-medium">{item.name}</span>
                      <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t pt-5 text-lg font-black">
                <span>Total</span><span>{formatCurrency(selected.totalAmount)}</span>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">Update status</p>
                <div className="grid gap-2">
                  {(transitions[selected.status] ?? []).map((status) => (
                    <Button
                      disabled={mutation.isPending}
                      key={status}
                      onClick={() => mutation.mutate({ order: selected, status })}
                      variant={status === "cancelled" ? "destructive" : "default"}
                    >
                      Mark as {status.replaceAll("_", " ")}
                    </Button>
                  ))}
                  {!transitions[selected.status]?.length && (
                    <p className="rounded-xl bg-muted p-3 text-center text-sm text-muted-foreground">
                      This order has no further vendor actions.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
