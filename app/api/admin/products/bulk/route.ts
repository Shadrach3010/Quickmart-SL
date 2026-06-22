import { bulkUpdateAdminProducts } from "@/services";
import { adminProductBulkSchema } from "@/validations";

export async function PATCH(request: Request) {
  const parsed = adminProductBulkSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid bulk action." }, { status: 400 });
  try {
    return Response.json({
      data: await bulkUpdateAdminProducts(parsed.data.ids, parsed.data.isActive),
    });
  } catch (error) {
    console.error("Admin product bulk update failed.", error);
    return Response.json({ error: "Unable to update products." }, { status: 500 });
  }
}
