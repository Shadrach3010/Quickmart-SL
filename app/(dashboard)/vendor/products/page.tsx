import { VendorPageHeading } from "@/components/vendor/page-heading";
import { ProductManager } from "@/features/vendor/components/product-manager";
import { getVendorProducts } from "@/services";

export default async function VendorProductsPage() {
  const products = await getVendorProducts();
  return (
    <div className="mx-auto max-w-[90rem]">
      <VendorPageHeading
        description="Create, price, and publish products in your storefront."
        title="Products"
      />
      <ProductManager initialProducts={products} />
    </div>
  );
}
