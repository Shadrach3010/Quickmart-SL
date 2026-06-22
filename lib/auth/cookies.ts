import "server-only";

import { cookies } from "next/headers";
import { AUTH_COOKIES } from "@/lib/constants/auth";
import type { SupabaseAuthSession } from "@/lib/supabase/auth";

function shouldUseSecureCookies() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).protocol === "https:";
    } catch {
      // Fall back to the runtime environment when the configured URL is invalid.
    }
  }
  return process.env.NODE_ENV === "production";
}

export async function setAuthCookies(session: SupabaseAuthSession) {
  const store = await cookies();
  const shared = {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax" as const,
    path: "/",
  };
  store.set(AUTH_COOKIES.access, session.access_token, {
    ...shared,
    maxAge: session.expires_in,
  });
  store.set(AUTH_COOKIES.refresh, session.refresh_token, {
    ...shared,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(AUTH_COOKIES.access);
  store.delete(AUTH_COOKIES.refresh);
}
