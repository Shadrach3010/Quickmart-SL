import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
  return (
    <div className="marketplace-container space-y-8 py-8">
      <Skeleton className="h-72 rounded-[2rem]" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <Skeleton className="h-56 rounded-2xl" key={index} />)}
      </div>
    </div>
  );
}
