"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Vendor } from "@/types";

export function SupermarketRating({ supermarket }: { supermarket: Vendor }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    const response = await fetch("/api/supermarket-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supermarketId: supermarket.id, rating }),
    });
    const body = await response.json();
    setPending(false);
    if (response.status === 401) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/supermarkets/${supermarket.slug}`)}`);
      return;
    }
    if (!response.ok) {
      toast.error(body.error ?? "Unable to save your rating.");
      return;
    }
    toast.success("Supermarket rating saved.");
  }

  return (
    <section className="mt-10 rounded-3xl border bg-card p-5 md:p-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div><p className="text-sm font-semibold text-primary">Community feedback</p><h2 className="mt-1 text-2xl font-black">Rate {supermarket.name}</h2><p className="mt-1 text-sm text-muted-foreground">How was product quality, packing, and service?</p></div>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rate supermarket">{Array.from({ length: 5 }, (_, index) => <button aria-checked={rating === index + 1} aria-label={`${index + 1} stars`} className="p-1 text-amber-500" key={index} onClick={() => setRating(index + 1)} role="radio" type="button"><Star className={`size-7 ${index < rating ? "fill-current" : ""}`} /></button>)}</div>
      </div>
      {rating > 0 && <Button className="mt-4" disabled={pending} onClick={save} size="sm">{pending ? "Saving…" : "Save rating"}</Button>}
    </section>
  );
}
