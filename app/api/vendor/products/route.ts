import { createVendorProduct, getVendorProducts } from "@/services";
import { vendorProductSchema } from "@/validations";

export async function GET() {
  try {
    return Response.json({ data: await getVendorProducts() });
  } catch (error) {
    console.error("Vendor products query failed.", error);
    return Response.json({ error: "Unable to load products." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const parsed = vendorProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid product.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    return Response.json(
      { data: await createVendorProduct(parsed.data) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Vendor product creation failed.", error);
    return Response.json({ error: "Unable to create product." }, { status: 500 });
  }
}
