import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const client = await getSupabaseServerClient();
  const rows = await client.request<Array<{ id: string; read_at: string | null }>>(
    `/rest/v1/notifications?profile_id=eq.${profile.id}&select=id,read_at&order=created_at.desc`,
    { cache: "no-store" },
  );
  return Response.json({ data: rows });
}

export async function PATCH(request: Request) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const body = await request.json();
  const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : [];
  if (!ids.length) return Response.json({ error: "Select at least one notification." }, { status: 400 });
  const client = await getSupabaseServerClient();
  await client.request(
    `/rest/v1/notifications?profile_id=eq.${profile.id}&id=in.(${ids.map(encodeURIComponent).join(",")})`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ read_at: new Date().toISOString() }),
    },
  );
  return Response.json({ data: { updated: ids.length } });
}
