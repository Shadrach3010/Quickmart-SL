"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Minus, PackageCheck, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/lib/query-keys";
import type { VendorProduct } from "@/types";

async function loadProducts() {
  const response = await fetch("/api/vendor/products");
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Unable to load inventory.");
  return body.data as VendorProduct[];
}

export function InventoryManager({
  initialProducts,
}: {
  initialProducts: VendorProduct[];
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const { data = initialProducts } = useQuery({
    initialData: initialProducts,
    queryFn: loadProducts,
    queryKey: queryKeys.products.all,
  });
  const mutation = useMutation({
    mutationFn: async ({
      product,
      quantity,
    }: {
      product: VendorProduct;
      quantity: number;
    }) => {
      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "inventory",
          stockQuantity: Math.max(0, quantity),
          lowStockThreshold: product.lowStockThreshold,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to update stock.");
      return body.data as VendorProduct;
    },
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });
      const previous = queryClient.getQueryData<VendorProduct[]>(
        queryKeys.products.all,
      );
      queryClient.setQueryData<VendorProduct[]>(
        queryKeys.products.all,
        (current = []) =>
          current.map((item) =>
            item.id === product.id
              ? { ...item, stockQuantity: Math.max(0, quantity) }
              : item,
          ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.products.all, context.previous);
      }
    },
  });
  const filtered = useMemo(
    () =>
      data.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) &&
          (!lowOnly || product.stockQuantity <= product.lowStockThreshold),
      ),
    [data, lowOnly, query],
  );
  const lowStock = data.filter(
    (product) => product.stockQuantity <= product.lowStockThreshold,
  ).length;
  const outOfStock = data.filter((product) => product.stockQuantity === 0).length;

  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <PackageCheck />
            </span>
            <div><p className="text-2xl font-black">{data.length}</p><p className="text-xs text-muted-foreground">Tracked products</p></div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle />
            </span>
            <div><p className="text-2xl font-black">{lowStock}</p><p className="text-xs text-muted-foreground">Low stock</p></div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle />
            </span>
            <div><p className="text-2xl font-black">{outOfStock}</p><p className="text-xs text-muted-foreground">Out of stock</p></div>
          </div>
        </div>
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="h-10 bg-white pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search inventory"
            value={query}
          />
        </div>
        <Button
          onClick={() => setLowOnly((value) => !value)}
          variant={lowOnly ? "default" : "outline"}
        >
          <AlertTriangle /> Low stock only
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Alert level</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Stock quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => {
              const low = product.stockQuantity <= product.lowStockThreshold;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-muted text-xl">
                        {product.imageUrl ?? "📦"}
                      </span>
                      <div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{product.unit}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.sku ?? "—"}</TableCell>
                  <TableCell>{product.lowStockThreshold} units</TableCell>
                  <TableCell>
                    <Badge variant={product.stockQuantity === 0 ? "destructive" : low ? "secondary" : "default"}>
                      {product.stockQuantity === 0 ? "Out of stock" : low ? "Low stock" : "In stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        aria-label={`Reduce ${product.name} stock`}
                        onClick={() =>
                          mutation.mutate({
                            product,
                            quantity: product.stockQuantity - 1,
                          })
                        }
                        size="icon"
                        variant="outline"
                      >
                        <Minus />
                      </Button>
                      <Input
                        aria-label={`${product.name} stock`}
                        className={`h-10 w-20 text-center font-bold ${low ? "text-amber-700" : ""}`}
                        key={`${product.id}-${product.stockQuantity}`}
                        min="0"
                        onBlur={(event) =>
                          mutation.mutate({
                            product,
                            quantity: Number(event.target.value),
                          })
                        }
                        type="number"
                        defaultValue={product.stockQuantity}
                      />
                      <Button
                        aria-label={`Increase ${product.name} stock`}
                        onClick={() =>
                          mutation.mutate({
                            product,
                            quantity: product.stockQuantity + 1,
                          })
                        }
                        size="icon"
                        variant="outline"
                      >
                        <Plus />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
