import { Clock3, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Vendor } from "@/types";

export function SupermarketCard({ supermarket }: { supermarket: Vendor }) {
  return (
    <Link
      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      href={`/supermarkets/${supermarket.slug}`}
    >
      <div
        className="relative h-36 overflow-hidden p-5"
        style={{ background: supermarket.coverUrl ?? undefined }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.35),transparent_35%)]" />
        <div className="relative grid size-14 place-items-center rounded-2xl bg-white text-2xl font-black text-primary shadow-lg">
          {supermarket.name.charAt(0)}
        </div>
        {supermarket.tags?.[0] && (
          <Badge className="absolute bottom-4 right-4 bg-white/90 text-foreground">
            {supermarket.tags[0]}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold group-hover:text-primary">{supermarket.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{supermarket.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs font-medium">
          {supermarket.rating !== undefined && (
            <span className="flex items-center gap-1"><Star className="size-3.5 fill-accent text-accent" /> {supermarket.rating.toFixed(1)}</span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="size-3.5" /> {supermarket.deliveryTime}</span>
          <span className="ml-auto text-primary">SLE {supermarket.deliveryFee}</span>
        </div>
      </div>
    </Link>
  );
}
