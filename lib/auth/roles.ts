import {
  APP_ROLES,
  ROLE_HOME_ROUTES,
} from "@/lib/constants/roles";
import type { AppRole } from "@/types";

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function getRoleHomeRoute(role: AppRole): string {
  return ROLE_HOME_ROUTES[role];
}
