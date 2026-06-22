import { CartView } from "@/features/cart/components/cart-view";

export default function CartPage() {
  return (
    <div className="marketplace-container py-8 md:py-12">
      <h1 className="text-3xl font-black tracking-tight md:text-5xl">Your cart</h1>
      <p className="mb-7 mt-2 text-muted-foreground">Review your groceries before checkout.</p>
      <CartView />
    </div>
  );
}
