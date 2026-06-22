import { Banknote, Building2, ReceiptText, Users, WalletCards } from "lucide-react";
import Link from "next/link";
import { AdminMetricCard } from "@/components/admin/metric-card";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlatformRevenueChart } from "@/features/admin";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getAdminDashboard } from "@/services";

export default async function AdminDashboardPage() {
  const { metrics, analytics, orders, payments } = await getAdminDashboard();
  return <>
    <AdminPageHeading
      action={<Link className={cn(buttonVariants({ variant: "outline" }), "bg-white")} href="/admin/analytics">View full analytics</Link>}
      description="A live operational view of marketplace growth, revenue, and fulfillment."
      title="Platform overview"
    />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AdminMetricCard accent="blue" change={metrics.userChange} icon={Users} label="Total users" value={formatNumber(metrics.totalUsers)} />
      <AdminMetricCard accent="violet" change={metrics.supermarketChange} icon={Building2} label="Supermarkets" value={formatNumber(metrics.totalSupermarkets)} />
      <AdminMetricCard accent="amber" change={metrics.orderChange} icon={ReceiptText} label="Total orders" value={formatNumber(metrics.totalOrders)} />
      <AdminMetricCard change={metrics.revenueChange} icon={Banknote} label="Revenue" value={formatCurrency(metrics.revenue)} />
      <AdminMetricCard accent="rose" icon={WalletCards} label="Commissions" value={formatCurrency(metrics.commissions)} />
    </div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Revenue & commissions</CardTitle></CardHeader><CardContent><PlatformRevenueChart data={analytics.trend} /></CardContent></Card>
      <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Payment health</CardTitle></CardHeader><CardContent className="space-y-3">
        {payments.map((payment) => <div className="flex items-center justify-between gap-3 rounded-xl border p-3" key={payment.id}><div className="min-w-0"><p className="truncate text-sm font-semibold">{payment.provider}</p><p className="truncate text-xs text-muted-foreground">{payment.orderNumber}</p></div><div className="text-right"><p className="text-sm font-bold">{formatCurrency(payment.amount)}</p><StatusBadge status={payment.status}/></div></div>)}
        <Link className="block text-center text-sm font-semibold text-primary" href="/admin/payments">Monitor all payments →</Link>
      </CardContent></Card>
    </div>
    <Card className="mt-5 gap-0 border-0 py-0 shadow-sm"><CardHeader className="py-4"><CardTitle>Recent orders</CardTitle></CardHeader>
      <Table><TableHeader className="bg-slate-50"><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Supermarket</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
        <TableBody>{orders.map((order) => <TableRow key={order.id}><TableCell className="font-mono text-xs font-semibold">{order.orderNumber}</TableCell><TableCell>{order.customer}</TableCell><TableCell>{order.supermarket}</TableCell><TableCell><StatusBadge status={order.status}/></TableCell><TableCell className="text-right font-semibold">{formatCurrency(order.total)}</TableCell></TableRow>)}</TableBody>
      </Table>
      <div className="border-t p-3 text-right"><Link className={buttonVariants({ size: "sm", variant: "ghost" })} href="/admin/orders">View all orders</Link></div>
    </Card>
  </>;
}
