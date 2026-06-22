import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ supermarketId: z.string().uuid(), rating: z.number().int().min(1).max(5) });

export async function POST(request: Request) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Choose a rating." }, { status: 400 });
  const client = await getSupabaseServerClient();
  const delivered = await client.request<Array<{ id: string }>>(
    `/rest/v1/orders?customer_profile_id=eq.${profile.id}&supermarket_id=eq.${parsed.data.supermarketId}&status=eq.delivered&select=id&limit=1`,
  );
  await client.request("/rest/v1/supermarket_reviews?on_conflict=profile_id,supermarket_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      profile_id: profile.id,
      supermarket_id: parsed.data.supermarketId,
      rating: parsed.data.rating,
      is_verified_order: delivered.length > 0,
      order_id: delivered[0]?.id ?? null,
    }),
  });
  return Response.json({ data: { saved: true } });
}
