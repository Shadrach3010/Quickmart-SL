"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import type { RevenuePoint, TopProduct } from "@/types";

const COLORS = ["#157347", "#42a972", "#84c59d", "#f4b942", "#9aab9e"];

export function SalesBarChart({ data }: { data: RevenuePoint[] }) {
  if (!data.length) {
    return <div className="grid h-80 min-w-0 place-items-center rounded-2xl border border-dashed text-sm text-muted-foreground">Sales data appears after your first order.</div>;
  }
  return (
    <div className="h-80 min-h-80 min-w-0">
      <ResponsiveContainer height="100%" minWidth={0} width="100%">
        <BarChart data={data} margin={{ left: -10 }}>
          <CartesianGrid stroke="#e8ece8" strokeDasharray="3 3" vertical={false} />
          <XAxis axisLine={false} dataKey="label" tickLine={false} />
          <YAxis
            axisLine={false}
            fontSize={11}
            tickFormatter={(value) => `${value / 1000}k`}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #dfe6df" }}
            formatter={(value) => formatCurrency(Number(value ?? 0))}
          />
          <Bar dataKey="revenue" fill="#157347" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProductShareChart({ data }: { data: TopProduct[] }) {
  if (!data.length) {
    return <div className="grid h-80 min-w-0 place-items-center rounded-2xl border border-dashed text-sm text-muted-foreground">Product share appears after sales are recorded.</div>;
  }
  return (
    <div className="h-80 min-h-80 min-w-0">
      <ResponsiveContainer height="100%" minWidth={0} width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="revenue"
            innerRadius={65}
            nameKey="name"
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #dfe6df" }}
            formatter={(value) => formatCurrency(Number(value ?? 0))}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
