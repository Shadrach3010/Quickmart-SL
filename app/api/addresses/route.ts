import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { deliveryAddressSchema } from "@/validations";

export async function POST(request: Request) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const parsed = deliveryAddressSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Check the delivery address.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const client = await getSupabaseServerClient();
  const rows = await client.request<Array<{ id: string }>>("/rest/v1/addresses?select=id", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      profile_id: profile.id,
      label: parsed.data.label,
      recipient_name: parsed.data.recipientName,
      phone: parsed.data.phone,
      address_line: parsed.data.addressLine,
      city: parsed.data.city,
      landmark: parsed.data.landmark,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    }),
  });
  return Response.json({ data: rows[0] }, { status: 201 });
}
