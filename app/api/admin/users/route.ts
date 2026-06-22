import { getAdminUsers } from "@/services";

export async function GET() {
  try {
    return Response.json({ data: await getAdminUsers() });
  } catch (error) {
    console.error("Admin users query failed.", error);
    return Response.json({ error: "Unable to load users." }, { status: 500 });
  }
}
