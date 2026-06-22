"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AuthRedirectError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-7 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle />
        </span>
        <h1 className="mt-5 text-2xl font-black">Account setup needs attention</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your Supabase session is active, but QuickMart could not load your
          profile and role.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
