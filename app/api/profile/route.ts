import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { phoneSchema } from "@/validations/common";

const schema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  phone: z.union([phoneSchema, z.literal("")]),
});

export async function PATCH(request: Request) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Check your profile details.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const client = await getSupabaseServerClient();
  await client.request(`/rest/v1/profiles?id=eq.${profile.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone || null,
    }),
  });
  return Response.json({ data: { updated: true } });
}
