import { MarketplaceFooter } from "@/components/marketplace/marketplace-footer";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import type { LayoutProps } from "@/types";

export function PublicLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketplaceHeader />
      <main className="flex-1" id="main-content">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
