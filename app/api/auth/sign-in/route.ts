import { setAuthCookies } from "@/lib/auth/cookies";
import { signInWithPassword, SupabaseAuthError } from "@/lib/supabase/auth";
import { signInSchema } from "@/validations";

export async function POST(request: Request) {
  const parsed = signInSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Check your email and password.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const session = await signInWithPassword(parsed.data.email, parsed.data.password);
    await setAuthCookies(session);
    return Response.json({ data: { redirectTo: "/auth/redirect" } });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      const normalized = `${error.code ?? ""} ${error.message}`.toLowerCase();
      if (normalized.includes("email_not_confirmed") || normalized.includes("email not confirmed")) {
        return Response.json(
          { error: "Please confirm your email before signing in.", code: "email_not_confirmed" },
          { status: 403 },
        );
      }
      if (
        normalized.includes("invalid_credentials") ||
        normalized.includes("invalid login credentials")
      ) {
        return Response.json(
          { error: "The email or password is incorrect.", code: "invalid_credentials" },
          { status: 401 },
        );
      }
    }
    return Response.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
