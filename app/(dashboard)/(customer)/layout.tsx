import { CustomerLayout } from "@/components/layouts/customer-layout";
import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import type { LayoutProps } from "@/types";

export default async function CustomerRouteLayout({ children }: LayoutProps) {
  await requireRole(USER_ROLES.CUSTOMER);

  return <CustomerLayout>{children}</CustomerLayout>;
}
