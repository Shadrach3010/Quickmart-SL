import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listProducts } from "@/services/catalog";

export async function GET() {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const client = await getSupabaseServerClient();
  const rows = await client.request<Array<{ product_id: string }>>(
    `/rest/v1/recently_viewed_products?profile_id=eq.${profile.id}&select=product_id&order=viewed_at.desc&limit=6`,
    { cache: "no-store" },
  );
  const order = rows.map((row) => row.product_id);
  const products = await listProducts();
  const byId = new Map(products.map((product) => [product.id, product]));
  return Response.json({ data: order.map((id) => byId.get(id)).filter(Boolean) });
}

export async function POST(request: Request) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const body = await request.json();
  if (typeof body.productId !== "string") return Response.json({ error: "Product is required." }, { status: 400 });
  const client = await getSupabaseServerClient();
  await client.request("/rest/v1/recently_viewed_products?on_conflict=profile_id,product_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      profile_id: profile.id,
      product_id: body.productId,
      viewed_at: new Date().toISOString(),
      view_count: 1,
    }),
  });
  return Response.json({ data: { recorded: true } });
}
