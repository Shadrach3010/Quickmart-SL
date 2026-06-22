import { getPlatformSettings, updatePlatformSettings } from "@/services";
import { platformSettingsSchema } from "@/validations";

export async function GET() {
  try {
    return Response.json({ data: await getPlatformSettings() });
  } catch (error) {
    console.error("Admin settings query failed.", error);
    return Response.json({ error: "Unable to load settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const parsed = platformSettingsSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid settings." }, { status: 400 });
  try {
    return Response.json({ data: await updatePlatformSettings(parsed.data) });
  } catch (error) {
    console.error("Admin settings update failed.", error);
    return Response.json({ error: "Unable to update settings." }, { status: 500 });
  }
}
