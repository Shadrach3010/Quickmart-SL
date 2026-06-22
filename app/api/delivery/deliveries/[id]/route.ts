import { updateOwnDeliveryStatus } from "@/services";
import { deliveryStatusUpdateSchema } from "@/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = deliveryStatusUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid delivery status." }, { status: 400 });
  }
  try {
    const { id } = await params;
    return Response.json({
      data: await updateOwnDeliveryStatus(id, parsed.data.status),
    });
  } catch (error) {
    console.error("Delivery status update failed.", error);
    return Response.json({ error: "Unable to update delivery." }, { status: 500 });
  }
}
