import { VendorShell } from "@/components/vendor/vendor-shell";
import type { LayoutProps } from "@/types";
import type { VendorSupermarket } from "@/types";

export function VendorLayout({
  children,
  supermarket,
}: LayoutProps & { supermarket: VendorSupermarket }) {
  return (
    <VendorShell supermarket={supermarket}>
      {children}
    </VendorShell>
  );
}
