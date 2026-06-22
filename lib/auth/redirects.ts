import "server-only";

import { redirect } from "next/navigation";
import { getRoleHomeRoute } from "@/lib/auth/roles";
import { ROUTES } from "@/lib/constants/routes";
import type { AppRole } from "@/types";

export function redirectToRoleHome(role: AppRole): never {
  redirect(getRoleHomeRoute(role));
}

export function redirectToSignIn(returnBackUrl?: string): never {
  const search = returnBackUrl
    ? `?redirect_url=${encodeURIComponent(returnBackUrl)}`
    : "";

  redirect(`${ROUTES.signIn}${search}`);
}
