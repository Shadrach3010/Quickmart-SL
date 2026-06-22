import { setAuthCookies } from "@/lib/auth/cookies";
import { getServerEnv } from "@/lib/env";
import { z } from "zod";

const schema = z.object({
  accessToken: z.string().min(20),
  refreshToken: z.string().min(20),
  expiresIn: z.coerce.number().int().positive().default(3600),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid recovery session." }, { status: 400 });
  }

  const env = getServerEnv();
  const verification = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${parsed.data.accessToken}`,
    },
    cache: "no-store",
  });
  if (!verification.ok) {
    return Response.json({ error: "The recovery link is invalid or expired." }, { status: 401 });
  }
  const user = await verification.json();
  await setAuthCookies({
    access_token: parsed.data.accessToken,
    refresh_token: parsed.data.refreshToken,
    expires_in: parsed.data.expiresIn,
    token_type: "bearer",
    user,
  });
  return Response.json({ data: { ready: true } });
}
