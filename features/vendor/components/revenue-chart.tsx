"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import type { RevenuePoint } from "@/types";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (!data.length) {
    return <div className="grid h-72 min-w-0 place-items-center rounded-2xl border border-dashed text-sm text-muted-foreground">Revenue appears after your first order.</div>;
  }
  return (
    <div className="h-72 min-h-72 min-w-0 w-full">
      <ResponsiveContainer height="100%" minWidth={0} width="100%">
        <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#157347" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#157347" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8ece8" strokeDasharray="3 3" vertical={false} />
          <XAxis axisLine={false} dataKey="label" fontSize={12} tickLine={false} />
          <YAxis
            axisLine={false}
            fontSize={11}
            tickFormatter={(value) => `${value / 1000}k`}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #dfe6df",
              boxShadow: "0 12px 30px rgba(16,38,27,.12)",
            }}
            formatter={(value) => [
              formatCurrency(Number(value ?? 0)),
              "Revenue",
            ]}
          />
          <Area
            dataKey="revenue"
            fill="url(#revenueFill)"
            stroke="#157347"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
