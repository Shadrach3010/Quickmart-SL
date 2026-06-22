import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerLoading() {
  return (
    <div className="marketplace-container space-y-6 py-10">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}
