import { AdminLayout } from "@/components/layouts/admin-layout";
import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import type { LayoutProps } from "@/types";

export default async function AdminRouteLayout({ children }: LayoutProps) {
  await requireRole(USER_ROLES.ADMIN);

  return <AdminLayout>{children}</AdminLayout>;
}
