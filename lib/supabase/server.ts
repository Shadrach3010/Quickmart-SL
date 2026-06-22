import "server-only";

import { getServerEnv } from "@/lib/env";
import { getAccessToken } from "@/lib/auth/session";
import { SupabaseClient } from "@/lib/supabase/client";

export async function getSupabaseServerClient() {
  const env = getServerEnv();
  const accessToken = await getAccessToken();
  const client = new SupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return {
    request: <T>(path: string, init?: RequestInit) =>
      client.request<T>(path, {
        ...init,
        accessToken: accessToken ?? undefined,
      }),
    storageUrl: client.storageUrl.bind(client),
  };
}

export function getSupabaseAdminClient() {
  const env = getServerEnv();

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return new SupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
