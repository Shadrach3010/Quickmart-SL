import { DeliveryDashboard } from "@/features/delivery";
import { getDeliveryDashboard } from "@/services";

export default async function DeliveryPage() {
  return <DeliveryDashboard initial={await getDeliveryDashboard()} />;
}
