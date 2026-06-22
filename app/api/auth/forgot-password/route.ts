import { requestPasswordRecovery } from "@/lib/supabase/auth";
import { forgotPasswordSchema } from "@/validations";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  try {
    await requestPasswordRecovery(parsed.data.email, `${origin}/reset-password`);
  } catch {
    // Keep the response identical to avoid disclosing whether an account exists.
  }
  return Response.json({ data: { sent: true } });
}
