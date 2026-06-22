import { getVendorSupermarket, updateVendorSettings } from "@/services";
import { vendorSettingsSchema } from "@/validations";

export async function GET() {
  try {
    return Response.json({ data: await getVendorSupermarket() });
  } catch (error) {
    console.error("Vendor settings query failed.", error);
    return Response.json({ error: "Unable to load settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const parsed = vendorSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid settings.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    return Response.json({ data: await updateVendorSettings(parsed.data) });
  } catch (error) {
    console.error("Vendor settings update failed.", error);
    return Response.json({ error: "Unable to update settings." }, { status: 500 });
  }
}
