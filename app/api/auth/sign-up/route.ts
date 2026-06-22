import { setAuthCookies } from "@/lib/auth/cookies";
import { signUpWithPassword, SupabaseAuthError } from "@/lib/supabase/auth";
import { signUpSchema } from "@/validations";
import { connectSignupReferral } from "@/services/referrals";

export async function POST(request: Request) {
  const parsed = signUpSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Check the highlighted fields.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await signUpWithPassword({
      ...parsed.data,
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    });
    await connectSignupReferral(result.user.id, parsed.data.referralCode || undefined).catch(
      () => undefined,
    );
    if (result.access_token && result.refresh_token && result.expires_in && result.user) {
      await setAuthCookies(result as Parameters<typeof setAuthCookies>[0]);
      return Response.json({ data: { requiresEmailConfirmation: false } });
    }
    return Response.json({
      data: { requiresEmailConfirmation: true, email: parsed.data.email },
    });
  } catch (error) {
    const message =
      error instanceof SupabaseAuthError && error.status < 500
        ? error.message
        : "Unable to create your account right now.";
    return Response.json({ error: message }, { status: 400 });
  }
}
