import { clearAuthCookies } from "@/lib/auth/cookies";
import { getAccessToken } from "@/lib/auth/session";
import { signOutAuthSession } from "@/lib/supabase/auth";

export async function POST() {
  const accessToken = await getAccessToken();
  if (accessToken) {
    await signOutAuthSession(accessToken).catch(() => undefined);
  }
  await clearAuthCookies();
  return Response.json({ data: { signedOut: true } });
}
