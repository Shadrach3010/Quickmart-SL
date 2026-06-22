import { assignAdminDelivery } from "@/services";
import { adminDeliveryAssignmentSchema } from "@/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = adminDeliveryAssignmentSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Select a delivery agent." }, { status: 400 });
  try {
    const { id } = await params;
    return Response.json({ data: await assignAdminDelivery(id, parsed.data.agentId) });
  } catch (error) {
    console.error("Admin delivery assignment failed.", error);
    return Response.json({ error: "Unable to assign delivery." }, { status: 500 });
  }
}
