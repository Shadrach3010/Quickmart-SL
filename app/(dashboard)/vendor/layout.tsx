import { VendorLayout } from "@/components/layouts/vendor-layout";
import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getVendorSupermarket } from "@/services";
import type { LayoutProps } from "@/types";

export default async function VendorRouteLayout({ children }: LayoutProps) {
  await requireRole(USER_ROLES.VENDOR);
  const supermarket = await getVendorSupermarket();

  return <VendorLayout supermarket={supermarket}>{children}</VendorLayout>;
}
