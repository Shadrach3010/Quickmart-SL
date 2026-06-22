import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { ROLE_IDS, USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types";

export async function setUserRole(
  authUserId: string,
  role: AppRole,
): Promise<void> {
  await requireRole(USER_ROLES.ADMIN);
  const client = await getSupabaseServerClient();
  const profiles = await client.request<Array<{ id: string }>>(
    `/rest/v1/profiles?auth_user_id=eq.${encodeURIComponent(authUserId)}&select=id`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ role_id: ROLE_IDS[role] }),
    },
  );
  if (!profiles[0]) {
    throw new Error(`No profile exists for auth user ${authUserId}.`);
  }
}
