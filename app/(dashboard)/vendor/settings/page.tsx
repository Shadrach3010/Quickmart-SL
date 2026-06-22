import { VendorPageHeading } from "@/components/vendor/page-heading";
import { SettingsForm } from "@/features/vendor/components/settings-form";
import { getVendorSupermarket } from "@/services";

export default async function VendorSettingsPage() {
  const supermarket = await getVendorSupermarket();
  return (
    <div className="mx-auto max-w-[90rem]">
      <VendorPageHeading
        description="Manage your storefront, delivery rules, and notifications."
        title="Settings"
      />
      <SettingsForm supermarket={supermarket} />
    </div>
  );
}
