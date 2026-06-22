import { AdminPageHeading } from "@/components/admin/page-heading";
import { DeliveriesManager } from "@/features/admin";
import { getAdminDeliveries, getAdminDeliveryAgents } from "@/services";

export default async function AdminDeliveriesPage() {
  const [deliveries, agents] = await Promise.all([getAdminDeliveries(), getAdminDeliveryAgents()]);
  return <><AdminPageHeading description="Assign agents, balance workloads, and track last-mile fulfillment." title="Delivery operations" /><DeliveriesManager initial={deliveries} initialAgents={agents} /></>;
}
