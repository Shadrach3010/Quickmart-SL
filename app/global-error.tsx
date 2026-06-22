"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en-SL"><body><main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-3xl font-black">QuickMart needs a moment</h1><p className="mt-2 text-slate-600">A critical error interrupted the application.</p><Button className="mt-5" onClick={reset}>Reload QuickMart</Button></div></main></body></html>;
}
