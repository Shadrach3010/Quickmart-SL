import { AdminPageHeading } from "@/components/admin/page-heading";
import { OrdersManager } from "@/features/admin";
import { getAdminOrders } from "@/services";

export default async function AdminOrdersPage() {
  return <><AdminPageHeading description="Track every customer order from placement through final delivery." title="Orders" /><OrdersManager initial={await getAdminOrders()} /></>;
}
