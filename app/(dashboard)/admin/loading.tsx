import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return <div className="space-y-5"><div><Skeleton className="h-8 w-48"/><Skeleton className="mt-2 h-4 w-96 max-w-full"/></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton className="h-32" key={index}/>)}</div><Skeleton className="h-96"/></div>;
}
