import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { getCurrentAuthUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants/routes";
import type { LayoutProps } from "@/types";

export default async function AuthenticationLayout({ children }: LayoutProps) {
  const user = await getCurrentAuthUser();

  if (user) {
    redirect(ROUTES.authRedirect);
  }

  return <AuthLayout>{children}</AuthLayout>;
}
