import { getAdminDeliveries, getAdminDeliveryAgents } from "@/services";

export async function GET() {
  try {
    const [deliveries, agents] = await Promise.all([
      getAdminDeliveries(),
      getAdminDeliveryAgents(),
    ]);
    return Response.json({ data: { deliveries, agents } });
  } catch (error) {
    console.error("Admin deliveries query failed.", error);
    return Response.json({ error: "Unable to load deliveries." }, { status: 500 });
  }
}
