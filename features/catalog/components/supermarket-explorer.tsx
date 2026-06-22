"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { SupermarketCard } from "@/components/marketplace/supermarket-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query-keys";
import type { Vendor } from "@/types";

export function SupermarketExplorer({
  initialSupermarkets,
  initialQuery = "",
}: {
  initialSupermarkets: Vendor[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [fastOnly, setFastOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.vendors.all,
    queryFn: async () => initialSupermarkets,
    initialData: initialSupermarkets,
    staleTime: Infinity,
  });
  const filtered = useMemo(
    () =>
      data.filter((store) => {
        const matches = `${store.name} ${store.description} ${store.tags?.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const isFast = !fastOnly || Number.parseInt(store.deliveryTime ?? "99") <= 25;
        const isTop = !topRated || (store.rating ?? 0) >= 4.7;
        return matches && isFast && isTop;
      }),
    [data, fastOnly, query, topRated],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="h-10 pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search supermarkets"
            value={query}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setFastOnly((value) => !value)} variant={fastOnly ? "default" : "outline"}>
            <SlidersHorizontal /> Fast delivery
          </Button>
          <Button onClick={() => setTopRated((value) => !value)} variant={topRated ? "default" : "outline"}>
            4.7+ rating
          </Button>
        </div>
      </div>
      <p className="my-5 text-sm text-muted-foreground">{filtered.length} supermarkets available</p>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton className="h-64 rounded-2xl" key={index} />)}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((store) => <SupermarketCard key={store.id} supermarket={store} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed p-12 text-center">
          <p className="font-bold">No supermarkets match those filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a broader search or clear a filter.</p>
        </div>
      )}
    </div>
  );
}
