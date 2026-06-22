import {
  CircleDollarSign,
  ReceiptText,
  ShoppingBasket,
  UsersRound,
} from "lucide-react";
import { MetricCard } from "@/components/vendor/metric-card";
import { VendorPageHeading } from "@/components/vendor/page-heading";
import {
  ProductShareChart,
  SalesBarChart,
} from "@/features/vendor/components/analytics-charts";
import { formatCurrency } from "@/lib/formatters";
import { getVendorDashboardData } from "@/services";

export default async function VendorAnalyticsPage() {
  const { metrics, revenue, topProducts } = await getVendorDashboardData();
  return (
    <div className="mx-auto max-w-[90rem]">
      <VendorPageHeading
        description="Understand revenue, demand, and the products driving growth."
        title="Analytics"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          change={metrics.revenueChange}
          icon={CircleDollarSign}
          title="Gross revenue"
          value={formatCurrency(metrics.revenue)}
        />
        <MetricCard
          change={metrics.ordersChange}
          icon={ReceiptText}
          title="Completed orders"
          value={metrics.orders.toString()}
        />
        <MetricCard
          change={metrics.averageOrderChange}
          icon={ShoppingBasket}
          title="Average basket"
          value={formatCurrency(metrics.averageOrderValue)}
        />
        <MetricCard
          change={metrics.customersChange}
          icon={UsersRound}
          title="Unique customers"
          value={metrics.customers.toString()}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-black">Revenue trend</h3>
            <p className="text-xs text-muted-foreground">Daily sales for the last 7 days</p>
          </div>
          <SalesBarChart data={revenue} />
        </section>
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-black">Product revenue share</h3>
            <p className="text-xs text-muted-foreground">Contribution from top products</p>
          </div>
          <ProductShareChart data={topProducts} />
        </section>
      </div>
      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h3 className="font-black">Top-selling products</h3>
          <p className="text-xs text-muted-foreground">Ranked by revenue this period</p>
        </div>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              className="grid items-center gap-3 sm:grid-cols-[2rem_1fr_6rem_7rem]"
              key={product.name}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-xs font-black">
                {index + 1}
              </span>
              <div>
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${product.share}%` }}
                  />
                </div>
              </div>
              <p className="hidden text-right text-sm text-muted-foreground sm:block">
                {product.units} units
              </p>
              <p className="hidden text-right text-sm font-black sm:block">
                {formatCurrency(product.revenue)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
