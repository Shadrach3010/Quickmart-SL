import { getAdminSupermarkets } from "@/services";

export async function GET() {
  try {
    return Response.json({ data: await getAdminSupermarkets() });
  } catch (error) {
    console.error("Admin supermarkets query failed.", error);
    return Response.json({ error: "Unable to load supermarkets." }, { status: 500 });
  }
}
