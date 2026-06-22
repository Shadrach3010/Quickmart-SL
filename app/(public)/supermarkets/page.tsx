import { SupermarketExplorer } from "@/features/catalog/components/supermarket-explorer";
import { listSupermarkets } from "@/services/catalog";

export default async function SupermarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q = "" }, supermarkets] = await Promise.all([
    searchParams,
    listSupermarkets(),
  ]);
  return (
    <div className="marketplace-container py-8 md:py-12">
      <p className="text-sm font-semibold text-primary">Delivery near Freetown</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Choose your supermarket</h1>
      <p className="mb-7 mt-3 max-w-2xl text-muted-foreground">
        Compare delivery time, fees, and product selection from active stores.
      </p>
      <SupermarketExplorer initialQuery={q} initialSupermarkets={supermarkets} />
    </div>
  );
}
