import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/favorites/[productId]">,
) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const { productId } = await context.params;
  const client = await getSupabaseServerClient();
  await client.request(
    `/rest/v1/favorites?profile_id=eq.${profile.id}&product_id=eq.${encodeURIComponent(productId)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
  return new Response(null, { status: 204 });
}
