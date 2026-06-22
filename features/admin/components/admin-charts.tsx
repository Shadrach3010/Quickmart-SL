"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import type { AdminAnalytics } from "@/types";

const colors = ["#10b981", "#2563eb", "#f59e0b", "#ef4444"];

export function PlatformRevenueChart({ data }: { data: AdminAnalytics["trend"] }) {
  if (!data.length) return <EmptyChart label="Revenue data appears after orders are placed." />;
  return <div className="h-80 min-h-80 min-w-0 w-full"><ResponsiveContainer height="100%" minWidth={0} width="100%">
    <AreaChart data={data} margin={{ left: -8, right: 8, top: 10 }}>
      <defs><linearGradient id="adminRevenue" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={.28}/><stop offset="100%" stopColor="#10b981" stopOpacity={.02}/></linearGradient></defs>
      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false}/>
      <XAxis axisLine={false} dataKey="label" fontSize={12} tickLine={false}/>
      <YAxis axisLine={false} fontSize={11} tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false}/>
      <Tooltip formatter={(value, name) => [formatCurrency(Number(value ?? 0)), name === "revenue" ? "GMV" : "Commission"]} />
      <Area dataKey="revenue" fill="url(#adminRevenue)" stroke="#10b981" strokeWidth={3} type="monotone"/>
      <Area dataKey="commissions" fill="transparent" stroke="#2563eb" strokeDasharray="5 4" strokeWidth={2} type="monotone"/>
    </AreaChart>
  </ResponsiveContainer></div>;
}

export function OrderStatusChart({ data }: { data: AdminAnalytics["orderStatus"] }) {
  if (!data.length) return <EmptyChart label="Order status data appears after orders are placed." />;
  return <div className="h-72 min-h-72 min-w-0 w-full"><ResponsiveContainer height="100%" minWidth={0} width="100%">
    <PieChart><Pie cx="50%" cy="50%" data={data} dataKey="value" innerRadius={65} outerRadius={95} paddingAngle={4}>
      {data.map((item, index) => <Cell fill={colors[index % colors.length]} key={item.name}/>)}
    </Pie><Tooltip formatter={(value) => [`${value}%`, "Share"]}/></PieChart>
  </ResponsiveContainer></div>;
}

export function SupermarketRevenueChart({ data }: { data: AdminAnalytics["supermarketRevenue"] }) {
  if (!data.length) return <EmptyChart label="Supermarket revenue appears after successful orders." />;
  return <div className="h-80 min-h-80 min-w-0 w-full"><ResponsiveContainer height="100%" minWidth={0} width="100%">
    <BarChart data={data} layout="vertical" margin={{ left: 30, right: 15 }}>
      <CartesianGrid horizontal={false} stroke="#e5e7eb" strokeDasharray="3 3"/>
      <XAxis axisLine={false} fontSize={11} tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} type="number"/>
      <YAxis axisLine={false} dataKey="name" fontSize={11} tickLine={false} type="category" width={95}/>
      <Tooltip formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}/>
      <Bar dataKey="revenue" fill="#2563eb" radius={[0, 6, 6, 0]}/>
    </BarChart>
  </ResponsiveContainer></div>;
}

function EmptyChart({ label }: { label: string }) {
  return <div className="grid h-80 min-w-0 place-items-center rounded-2xl border border-dashed px-4 text-center text-sm text-muted-foreground">{label}</div>;
}
