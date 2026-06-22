import { CheckoutForm } from "@/features/checkout/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="marketplace-container py-8 md:py-12">
      <h1 className="text-3xl font-black tracking-tight md:text-5xl">Checkout</h1>
      <p className="mb-7 mt-2 text-muted-foreground">Just a few details and your groceries are on the way.</p>
      <CheckoutForm />
    </div>
  );
}
