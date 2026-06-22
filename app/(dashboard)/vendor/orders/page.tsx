import { VendorPageHeading } from "@/components/vendor/page-heading";
import { OrdersManager } from "@/features/vendor/components/orders-manager";
import { getVendorOrders } from "@/services";

export default async function VendorOrdersPage() {
  const orders = await getVendorOrders();
  return (
    <div className="mx-auto max-w-[90rem]">
      <VendorPageHeading
        description="Review incoming orders and keep customers updated."
        title="Orders"
      />
      <OrdersManager initialOrders={orders} />
    </div>
  );
}
