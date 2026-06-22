import { getAdminPayments } from "@/services";

export async function GET() {
  try {
    return Response.json({ data: await getAdminPayments() });
  } catch (error) {
    console.error("Admin payments query failed.", error);
    return Response.json({ error: "Unable to load payments." }, { status: 500 });
  }
}
