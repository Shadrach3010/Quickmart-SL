"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRoleHomeRoute } from "@/lib/auth/roles";
import { queryKeys } from "@/lib/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { fetchWithSession } from "@/services/http-client";
import type { AppRole, UserProfile } from "@/types";

async function getProfile(): Promise<UserProfile | null> {
  const response = await fetchWithSession("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to load the current session.");
  return (await response.json()).data;
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: getProfile,
    staleTime: 60_000,
    retry: false,
  });
  return {
    isLoaded: !query.isLoading,
    isSignedIn: Boolean(query.data),
    user: query.data ?? null,
  };
}

export function useCurrentRole(): AppRole | null {
  return useCurrentUser().user?.role ?? null;
}

export function useRoleGuard(allowedRoles: AppRole[]) {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useCurrentUser();
  const role = user?.role ?? null;
  const isAllowed = Boolean(role && allowedRoles.includes(role));

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace(ROUTES.signIn);
    } else if (!isAllowed) {
      router.replace(ROUTES.unauthorized);
    }
  }, [isAllowed, isLoaded, isSignedIn, router]);

  return { isAllowed, isLoaded, role };
}

export function useRoleHome(): string {
  const role = useCurrentRole();
  return role ? getRoleHomeRoute(role) : ROUTES.signIn;
}
