import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const client = await getSupabaseServerClient();
  const rows = await client.request<Array<{ product_id: string }>>(
    `/rest/v1/favorites?profile_id=eq.${profile.id}&select=product_id`,
    { cache: "no-store" },
  );
  return Response.json({ data: rows.map((row) => row.product_id) });
}

export async function POST(request: Request) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const body = await request.json();
  if (typeof body.productId !== "string") return Response.json({ error: "Product is required." }, { status: 400 });
  const client = await getSupabaseServerClient();
  await client.request("/rest/v1/favorites?on_conflict=profile_id,product_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ profile_id: profile.id, product_id: body.productId }),
  });
  return Response.json({ data: { favorite: true } });
}
