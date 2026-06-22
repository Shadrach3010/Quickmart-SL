import { AdminPageHeading } from "@/components/admin/page-heading";
import { SupermarketsManager } from "@/features/admin";
import { getAdminSupermarkets, getAdminUsers } from "@/services";

export default async function AdminSupermarketsPage() {
  const [supermarkets, users] = await Promise.all([
    getAdminSupermarkets(),
    getAdminUsers(),
  ]);
  return <><AdminPageHeading description="Review vendor businesses, approve onboarding, and monitor marketplace performance." title="Supermarkets" /><SupermarketsManager initial={supermarkets} vendors={users.filter((user) => user.role === "vendor" || user.role === "admin")} /></>;
}
