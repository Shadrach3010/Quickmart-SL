import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AdminMetricCard({
  label, value, change, icon: Icon, accent = "emerald",
}: { label: string; value: string; change?: number; icon: LucideIcon; accent?: "emerald" | "blue" | "violet" | "amber" | "rose" }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700", amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
          {change !== undefined && (
            <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <span className={`grid size-11 place-items-center rounded-xl ${colors[accent]}`}><Icon className="size-5" /></span>
      </CardContent>
    </Card>
  );
}
