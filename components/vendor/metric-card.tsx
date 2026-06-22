import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  detail,
}: {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  detail?: string;
}) {
  const positive = change >= 0;
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span
          className={`flex items-center gap-1 font-bold ${
            positive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(change)}%
        </span>
        <span className="text-muted-foreground">{detail ?? "vs last period"}</span>
      </div>
    </article>
  );
}
