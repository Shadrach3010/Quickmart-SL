import { updateAdminSupermarket } from "@/services";
import { adminSupermarketUpdateSchema } from "@/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = adminSupermarketUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid supermarket update." }, { status: 400 });
  try {
    const { id } = await params;
    return Response.json({ data: await updateAdminSupermarket(id, parsed.data) });
  } catch (error) {
    console.error("Admin supermarket update failed.", error);
    return Response.json({ error: "Unable to update supermarket." }, { status: 500 });
  }
}
