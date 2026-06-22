import { AdminPageHeading } from "@/components/admin/page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusChart, PlatformRevenueChart, SupermarketRevenueChart } from "@/features/admin";
import { getAdminDashboard } from "@/services";

export default async function AdminAnalyticsPage() {
  const { analytics } = await getAdminDashboard();
  return <><AdminPageHeading description="Marketplace GMV, commission performance, order mix, and supermarket contribution." title="Platform analytics" />
    <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
      <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Revenue trend</CardTitle></CardHeader><CardContent><PlatformRevenueChart data={analytics.trend}/></CardContent></Card>
      <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Order status mix</CardTitle></CardHeader><CardContent><OrderStatusChart data={analytics.orderStatus}/><div className="grid grid-cols-2 gap-2">{analytics.orderStatus.map((item, index) => <div className="flex items-center gap-2 text-xs" key={item.name}><span className={`size-2 rounded-full ${["bg-emerald-500","bg-blue-600","bg-amber-500","bg-red-500"][index]}`}/><span className="text-muted-foreground">{item.name}</span><b className="ml-auto">{item.value}%</b></div>)}</div></CardContent></Card>
      <Card className="border-0 shadow-sm xl:col-span-2"><CardHeader><CardTitle>Revenue by supermarket</CardTitle></CardHeader><CardContent><SupermarketRevenueChart data={analytics.supermarketRevenue}/></CardContent></Card>
    </div>
  </>;
}
