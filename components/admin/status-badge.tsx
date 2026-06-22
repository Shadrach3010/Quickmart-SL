import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const value = status.replaceAll("_", " ");
  const className =
    ["active", "paid", "delivered", "available", "confirmed"].includes(status)
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : ["pending", "processing", "preparing", "assigned", "picked_up", "in_transit"].includes(status)
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : ["failed", "cancelled", "suspended", "closed"].includes(status)
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-50 text-slate-600";
  return <Badge className={`capitalize ${className}`} variant="outline">{value}</Badge>;
}
