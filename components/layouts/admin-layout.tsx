import type { LayoutProps } from "@/types";
import { AdminShell } from "@/components/admin/admin-shell";

export function AdminLayout({ children }: LayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
