import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Complete your rating, title, and review." }, { status: 400 });
  const client = await getSupabaseServerClient();
  const purchased = await client.request<Array<{ id: string }>>(
    `/rest/v1/order_items?product_id=eq.${parsed.data.productId}&orders.customer_profile_id=eq.${profile.id}&orders.status=eq.delivered&select=id,orders!inner(id)&limit=1`,
  );
  await client.request("/rest/v1/product_reviews?on_conflict=profile_id,product_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      profile_id: profile.id,
      product_id: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      is_verified_purchase: purchased.length > 0,
      order_item_id: purchased[0]?.id ?? null,
    }),
  });
  return Response.json({ data: { saved: true } });
}
