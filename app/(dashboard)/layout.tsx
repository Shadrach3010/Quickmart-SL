import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { requireUser } from "@/lib/auth/guards";
import type { LayoutProps } from "@/types";

export default async function AuthenticatedDashboardLayout({
  children,
}: LayoutProps) {
  await requireUser();

  return <DashboardLayout>{children}</DashboardLayout>;
}
