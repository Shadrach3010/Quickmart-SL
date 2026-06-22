import {
  deleteVendorProduct,
  updateVendorInventory,
  updateVendorProduct,
} from "@/services";
import { inventoryUpdateSchema, vendorProductSchema } from "@/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  try {
    if (body.mode === "inventory") {
      const parsed = inventoryUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json(
          {
            error: "Invalid inventory update.",
            fields: parsed.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }
      return Response.json({
        data: await updateVendorInventory(id, parsed.data),
      });
    }

    const parsed = vendorProductSchema.partial().safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid product update.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    const data = await updateVendorProduct(id, parsed.data);
    return Response.json({ data });
  } catch (error) {
    console.error("Vendor product update failed.", error);
    return Response.json({ error: "Unable to update product." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteVendorProduct(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Vendor product deletion failed.", error);
    return Response.json({ error: "Unable to delete product." }, { status: 500 });
  }
}
