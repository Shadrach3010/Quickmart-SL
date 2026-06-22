import { PublicLayout } from "@/components/layouts/public-layout";
import type { LayoutProps } from "@/types";

export default function PublicRouteLayout({ children }: LayoutProps) {
  return <PublicLayout>{children}</PublicLayout>;
}
