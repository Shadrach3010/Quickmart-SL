import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  ReceiptText,
  ShoppingBasket,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/vendor/metric-card";
import { VendorPageHeading } from "@/components/vendor/page-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RevenueChart } from "@/features/vendor/components/revenue-chart";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { getVendorDashboardData } from "@/services";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
} as const;

export default async function VendorDashboardPage() {
  const { metrics, orders, products, revenue, supermarket } =
    await getVendorDashboardData();
  const lowStock = products
    .filter((product) => product.stockQuantity <= product.lowStockThreshold)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[90rem]">
      <VendorPageHeading
        description={`Here's what is happening at ${supermarket.name} today.`}
        title="Good morning, manager"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          change={metrics.revenueChange}
          icon={CircleDollarSign}
          title="Revenue"
          value={formatCurrency(metrics.revenue)}
        />
        <MetricCard
          change={metrics.ordersChange}
          icon={ReceiptText}
          title="Orders"
          value={formatNumber(metrics.orders)}
        />
        <MetricCard
          change={metrics.averageOrderChange}
          icon={ShoppingBasket}
          title="Average order"
          value={formatCurrency(metrics.averageOrderValue)}
        />
        <MetricCard
          change={metrics.customersChange}
          icon={UsersRound}
          title="Customers"
          value={formatNumber(metrics.customers)}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-black">Revenue overview</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Link className="text-xs font-semibold text-primary" href="/vendor/analytics">
              Full analytics
            </Link>
          </div>
          <RevenueChart data={revenue} />
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black">Stock alerts</h3>
              <p className="text-xs text-muted-foreground">
                {metrics.lowStockProducts} products need attention
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="size-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {lowStock.map((product) => (
              <div className="flex items-center gap-3" key={product.id}>
                <span className="grid size-10 place-items-center rounded-xl bg-muted text-xl">
                  {product.imageUrl ?? "📦"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <span
                  className={`text-xs font-bold ${
                    product.stockQuantity === 0 ? "text-red-600" : "text-amber-700"
                  }`}
                >
                  {product.stockQuantity} left
                </span>
              </div>
            ))}
          </div>
          <Link
            className={buttonVariants({
              className: "mt-5 w-full",
              variant: "outline",
            })}
            href="/vendor/inventory"
          >
            Manage inventory <ArrowRight />
          </Link>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="font-black">Recent orders</h3>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingOrders} orders awaiting action
            </p>
          </div>
          <Link className="text-xs font-semibold text-primary" href="/vendor/orders">
            View all
          </Link>
        </div>
        <div className="divide-y">
          {orders.slice(0, 4).map((order) => (
            <Link
              className="grid gap-2 p-4 transition hover:bg-muted/40 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center"
              href={`/vendor/orders?order=${order.id}`}
              key={order.id}
            >
              <div>
                <p className="text-sm font-bold">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">{order.deliveryArea}</p>
              </div>
              <Badge
                className={statusStyles[order.status as keyof typeof statusStyles] ?? "bg-muted"}
              >
                {order.status.replaceAll("_", " ")}
              </Badge>
              <p className="text-sm font-black sm:text-right">
                {formatCurrency(order.totalAmount)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
