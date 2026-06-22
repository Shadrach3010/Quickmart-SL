import { updateVendorOrderStatus } from "@/services";
import { vendorOrderStatusSchema } from "@/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = vendorOrderStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid order status." }, { status: 400 });
  }

  try {
    return Response.json({
      data: await updateVendorOrderStatus(id, parsed.data),
    });
  } catch (error) {
    console.error("Vendor order update failed.", error);
    return Response.json({ error: "Unable to update order." }, { status: 500 });
  }
}
