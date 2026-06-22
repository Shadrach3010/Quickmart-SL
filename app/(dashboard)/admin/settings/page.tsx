import { AdminPageHeading } from "@/components/admin/page-heading";
import { AdminSettingsForm } from "@/features/admin";
import { getPlatformSettings } from "@/services";

export default async function AdminSettingsPage() {
  return <><AdminPageHeading description="Configure platform commissions, customer fees, support channels, and availability." title="Platform settings" /><AdminSettingsForm initial={await getPlatformSettings()} /></>;
}
