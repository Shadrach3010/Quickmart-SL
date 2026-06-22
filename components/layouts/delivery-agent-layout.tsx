import type { LayoutProps } from "@/types";
import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";

export function DeliveryAgentLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f4f7f4]" data-layout="delivery-agent">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="marketplace-container flex h-16 items-center">
          <Link className="font-black tracking-tight" href="/delivery">
            QuickMart <span className="text-primary">Delivery</span>
          </Link>
          <div className="ml-auto"><UserMenu /></div>
        </div>
      </header>
      <main className="marketplace-container py-6 md:py-8" id="main-content">{children}</main>
    </div>
  );
}
