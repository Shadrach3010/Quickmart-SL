import { AdminPageHeading } from "@/components/admin/page-heading";
import { ProductsManager } from "@/features/admin";
import { getAdminProducts } from "@/services";

export default async function AdminProductsPage() {
  return <><AdminPageHeading description="Moderate the complete marketplace catalog across every supermarket." title="Product catalog" /><ProductsManager initial={await getAdminProducts()} /></>;
}
