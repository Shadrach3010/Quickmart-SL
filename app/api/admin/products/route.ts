import { getAdminProducts } from "@/services";

export async function GET() {
  try {
    return Response.json({ data: await getAdminProducts() });
  } catch (error) {
    console.error("Admin products query failed.", error);
    return Response.json({ error: "Unable to load products." }, { status: 500 });
  }
}
