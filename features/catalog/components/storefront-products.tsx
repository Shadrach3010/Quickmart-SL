"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/marketplace/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types";

export function StorefrontProducts({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "all" || product.categoryId === category) &&
          product.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, products, query],
  );
  const categories = useMemo(
    () => Array.from(new Map(products.filter((product) => product.categoryId).map((product) => [
      product.categoryId,
      product.categoryName ?? "Other",
    ])).entries()),
    [products],
  );

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="h-10 bg-card pl-9 md:max-w-md"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this supermarket"
            value={query}
          />
        </div>
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
          <Button onClick={() => setCategory("all")} variant={category === "all" ? "default" : "outline"}>All</Button>
          {categories.map(([id, name]) => (
            <Button
              key={id}
              onClick={() => setCategory(id)}
              variant={category === id ? "default" : "outline"}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
      <p className="my-5 text-sm text-muted-foreground">{filtered.length} products</p>
      {filtered.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed p-12 text-center">
          <p className="font-bold">No products found.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or category.</p>
        </div>
      )}
    </div>
  );
}
