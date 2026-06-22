import { DeliveryAgentLayout } from "@/components/layouts/delivery-agent-layout";
import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import type { LayoutProps } from "@/types";

export default async function DeliveryAgentRouteLayout({
  children,
}: LayoutProps) {
  await requireRole(USER_ROLES.DELIVERY_AGENT);

  return <DeliveryAgentLayout>{children}</DeliveryAgentLayout>;
}
