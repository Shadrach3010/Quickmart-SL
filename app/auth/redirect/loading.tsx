import { Skeleton } from "@/components/ui/skeleton";

export default function AuthRedirectLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-7 text-center">
        <Skeleton className="mx-auto size-12 rounded-2xl" />
        <Skeleton className="mx-auto mt-5 h-7 w-52" />
        <Skeleton className="mx-auto mt-3 h-4 w-64 max-w-full" />
        <p className="mt-5 text-sm text-muted-foreground">
          Finishing your QuickMart account…
        </p>
      </div>
    </main>
  );
}
