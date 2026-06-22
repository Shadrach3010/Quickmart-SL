import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-[70vh] place-items-center px-4" id="main-content"><div className="text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-primary">404</p><h1 className="mt-2 text-4xl font-black">We couldn&apos;t find that aisle</h1><p className="mt-3 text-muted-foreground">The product or page may have moved.</p><Link className={`${buttonVariants()} mt-6`} href="/">Back to QuickMart</Link></div></main>;
}
