import { Banknote, CircleCheck, CircleX, Clock } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/metric-card";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { PaymentsManager } from "@/features/admin";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { getAdminPayments } from "@/services";

export default async function AdminPaymentsPage() {
  const payments = await getAdminPayments();
  const paid = payments.filter((payment) => payment.status === "paid");
  const failed = payments.filter((payment) => payment.status === "failed");
  const pending = payments.filter((payment) => ["pending", "processing"].includes(payment.status));
  return <><AdminPageHeading description="Monitor Orange Money, Afrimoney, cash, refunds, and provider references." title="Payments" />
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminMetricCard icon={Banknote} label="Processed value" value={formatCurrency(paid.reduce((sum, payment) => sum + payment.amount, 0))}/>
      <AdminMetricCard accent="blue" icon={CircleCheck} label="Successful" value={formatNumber(paid.length)}/>
      <AdminMetricCard accent="amber" icon={Clock} label="Pending" value={formatNumber(pending.length)}/>
      <AdminMetricCard accent="rose" icon={CircleX} label="Failed" value={formatNumber(failed.length)}/>
    </div><PaymentsManager initial={payments} /></>;
}
