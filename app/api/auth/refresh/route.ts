import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIES } from "@/lib/constants/auth";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { refreshAuthSession } from "@/lib/supabase/auth";
import { ROUTES } from "@/lib/constants/routes";

async function refreshSession() {
  const refreshToken = (await cookies()).get(AUTH_COOKIES.refresh)?.value;
  if (!refreshToken) return false;

  try {
    await setAuthCookies(await refreshAuthSession(refreshToken));
    return true;
  } catch {
    await clearAuthCookies();
    return false;
  }
}

export async function POST() {
  if (!(await refreshSession())) {
    return Response.json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
  }
  return Response.json({ data: { refreshed: true } });
}

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("next") ?? ROUTES.dashboard;
  const next = requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : ROUTES.dashboard;

  if (await refreshSession()) {
    return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL(ROUTES.signIn, request.url));
}
