import { resendSignupConfirmation, SupabaseAuthError } from "@/lib/supabase/auth";
import { forgotPasswordSchema } from "@/validations";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await resendSignupConfirmation(
      parsed.data.email,
      `${new URL(request.url).origin}/auth/callback`,
    );
    return Response.json({
      data: {
        message: "If this account still needs verification, a new confirmation email has been sent.",
      },
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError && error.status === 429) {
      return Response.json(
        { error: "Please wait a minute before requesting another email." },
        { status: 429 },
      );
    }
    return Response.json(
      { error: "Unable to resend the confirmation email right now." },
      { status: 500 },
    );
  }
}
