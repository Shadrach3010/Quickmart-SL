import { getAccessToken } from "@/lib/auth/session";
import { updateAuthPassword } from "@/lib/supabase/auth";
import { resetPasswordSchema } from "@/validations";

export async function POST(request: Request) {
  const parsed = resetPasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Choose a stronger password.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return Response.json({ error: "Your recovery session has expired." }, { status: 401 });
  }
  try {
    await updateAuthPassword(accessToken, parsed.data.password);
    return Response.json({ data: { updated: true } });
  } catch {
    return Response.json({ error: "Unable to update your password." }, { status: 400 });
  }
}
