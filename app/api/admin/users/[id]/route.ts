import { updateAdminUser } from "@/services";
import { adminUserUpdateSchema } from "@/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = adminUserUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid user update." }, { status: 400 });
  try {
    const { id } = await params;
    return Response.json({ data: await updateAdminUser(id, parsed.data) });
  } catch (error) {
    console.error("Admin user update failed.", error);
    return Response.json({ error: "Unable to update user." }, { status: 500 });
  }
}
