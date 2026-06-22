import { getAdminOrders } from "@/services";

export async function GET() {
  try {
    return Response.json({ data: await getAdminOrders() });
  } catch (error) {
    console.error("Admin orders query failed.", error);
    return Response.json({ error: "Unable to load orders." }, { status: 500 });
  }
}
