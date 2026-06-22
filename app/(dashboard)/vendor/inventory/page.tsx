import { VendorPageHeading } from "@/components/vendor/page-heading";
import { InventoryManager } from "@/features/vendor/components/inventory-manager";
import { getVendorProducts } from "@/services";

export default async function VendorInventoryPage() {
  const products = await getVendorProducts();
  return (
    <div className="mx-auto max-w-[90rem]">
      <VendorPageHeading
        description="Keep stock accurate and respond to low-stock alerts."
        title="Inventory"
      />
      <InventoryManager initialProducts={products} />
    </div>
  );
}
