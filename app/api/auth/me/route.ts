import { getCurrentProfile } from "@/lib/auth/session";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return Response.json({ error: "Unauthenticated." }, { status: 401 });
  }
  return Response.json({ data: profile });
}
