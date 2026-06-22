"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4" id="main-content">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle /></span>
        <h1 className="mt-5 text-3xl font-black">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">QuickMart could not load this view. Your cart and saved items are still safe.</p>
        <Button className="mt-5" onClick={reset}>Try again</Button>
        {error.digest && <p className="mt-3 text-xs text-muted-foreground">Reference: {error.digest}</p>}
      </div>
    </main>
  );
}
