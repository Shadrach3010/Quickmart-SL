import { Clock3, Headphones, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export function MarketplaceFooter() {
  return (
    <footer className="mt-16 border-t bg-[#102c20] text-white">
      <div className="marketplace-container grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-black">QuickMart SL</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
            Groceries from Freetown&apos;s favourite supermarkets, delivered
            with care.
          </p>
          <div className="mt-5 flex gap-4 text-xs text-white/70">
            <span className="flex items-center gap-1"><Truck className="size-4" /> Fast delivery</span>
            <span className="flex items-center gap-1"><ShieldCheck className="size-4" /> Secure payment</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">Quick links</p>
          <div className="mt-3 grid gap-2 text-sm text-white/65">
            <Link href="/supermarkets">Supermarkets</Link>
            <Link href="/orders">Track an order</Link>
            <Link href="/account">My account</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">We&apos;re here to help</p>
          <div className="mt-3 grid gap-2 text-sm text-white/65">
            <span className="flex items-center gap-2"><Clock3 className="size-4" /> Daily, 8am–10pm</span>
            <span className="flex items-center gap-2"><Headphones className="size-4" /> Customer support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
