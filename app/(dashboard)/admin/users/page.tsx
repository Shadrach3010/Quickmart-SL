import { Download } from "lucide-react";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { UsersManager } from "@/features/admin";
import { getAdminUsers } from "@/services";

export default async function AdminUsersPage() {
  return <><AdminPageHeading action={<Button variant="outline"><Download/> Export users</Button>} description="Manage access, roles, account status, and vendor or delivery permissions." title="Users & access" /><UsersManager initial={await getAdminUsers()} /></>;
}
