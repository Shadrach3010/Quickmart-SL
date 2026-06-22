import { getVendorOrders } from "@/services";

export async function GET() {
  try {
    return Response.json({ data: await getVendorOrders() });
  } catch (error) {
    console.error("Vendor orders query failed.", error);
    return Response.json({ error: "Unable to load orders." }, { status: 500 });
  }
}
