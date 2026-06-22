import { createCheckoutOrder } from "@/services/checkout";
import { checkoutSchema } from "@/validations";
import { getCurrentProfile } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/constants/roles";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return Response.json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
  }
  if (profile.role !== USER_ROLES.CUSTOMER) {
    return Response.json(
      { error: "Only customer accounts can place orders." },
      { status: 403 },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const firstFieldError = Object.values(fields).flat().find(Boolean);
    return Response.json(
      { error: firstFieldError ?? "Check your cart and delivery details.", fields },
      { status: 400 },
    );
  }

  try {
    const data = await createCheckoutOrder(parsed.data);
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const known = [
      "cart is empty",
      "unavailable",
      "insufficient stock",
      "enough stock",
      "one supermarket",
      "minimum order",
      "requires a minimum",
      "coupon is invalid",
      "delivery address",
      "stock changed",
    ].find((phrase) => message.toLowerCase().includes(phrase));
    console.error("Checkout failed", {
      profileId: profile.id,
      itemCount: parsed.data.items.length,
      cause: message,
    });
    return Response.json(
      {
        error: known
          ? extractDatabaseMessage(message)
          : "Unable to place your order right now. Please retry once.",
      },
      { status: known ? 400 : 500 },
    );
  }
}

function extractDatabaseMessage(message: string) {
  const jsonStart = message.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const details = JSON.parse(message.slice(jsonStart)) as { message?: string };
      if (details.message) return details.message;
    } catch {
      // Use the original application error below.
    }
  }
  return message.split(": ").at(-1) ?? message;
}
