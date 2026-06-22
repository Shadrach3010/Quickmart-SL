import { uploadVendorProductImage } from "@/services";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "An image file is required." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_SIZE) {
    return Response.json(
      { error: "Use a JPG, PNG, or WebP image up to 5 MB." },
      { status: 400 },
    );
  }

  try {
    return Response.json({
      data: await uploadVendorProductImage(id, file),
    });
  } catch (error) {
    console.error("Vendor product image upload failed.", error);
    const message = error instanceof Error ? error.message : "";
    return Response.json(
      {
        error: message.includes("Product not found")
          ? "The product no longer exists or is not assigned to your store."
          : message.includes("Bucket not found")
            ? "The product-images storage bucket is not configured."
            : "Unable to upload the image. Confirm that the product-images bucket exists and retry.",
      },
      { status: message.includes("Product not found") ? 404 : 500 },
    );
  }
}
