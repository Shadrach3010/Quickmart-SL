import "server-only";

import { redirect } from "next/navigation";
import { requireProfile, requireUser as requireSessionUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants/routes";
import type { AppRole } from "@/types";

export async function requireUser() {
  return requireSessionUser();
}

export async function requireRole(...allowedRoles: AppRole[]) {
  const profile = await requireProfile();

  if (!allowedRoles.includes(profile.role)) {
    redirect(ROUTES.unauthorized);
  }

  return { userId: profile.authUserId, role: profile.role, profile };
}
