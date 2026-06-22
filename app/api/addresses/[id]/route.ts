import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/addresses/[id]">,
) {
  await requireRole(USER_ROLES.CUSTOMER);
  const { id } = await context.params;
  const client = await getSupabaseServerClient();
  await client.request(`/rest/v1/addresses?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  return new Response(null, { status: 204 });
}
