import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIES } from "@/lib/constants/auth";
import { ROUTES } from "@/lib/constants/routes";

const authPrefixes = ["/sign-in", "/sign-up", "/forgot-password"];
const publicPrefixes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/api/auth",
  "/supermarkets",
  "/products",
  "/categories",
  "/cart",
  "/unauthorized",
];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIES.access)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIES.refresh)?.value;
  const isAuthRoute = startsWithAny(pathname, authPrefixes);
  const isPublicRoute = pathname === "/" || startsWithAny(pathname, publicPrefixes);

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL(ROUTES.authRedirect, request.url));
  }
  if (isAuthRoute && refreshToken) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("next", ROUTES.authRedirect);
    return NextResponse.redirect(refreshUrl);
  }

  if (isPublicRoute) return NextResponse.next();
  if (accessToken) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  if (refreshToken) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(refreshUrl);
  }

  const signInUrl = new URL(ROUTES.signIn, request.url);
  signInUrl.searchParams.set("redirect_url", `${pathname}${search}`);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
    "/(api|trpc)(.*)",
  ],
};
