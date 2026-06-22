import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return <main className="marketplace-container space-y-5 py-8" id="main-content"><Skeleton className="h-10 w-64"/><Skeleton className="h-64 rounded-3xl"/><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton className="aspect-square rounded-2xl" key={index}/>)}</div></main>;
}
