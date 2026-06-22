"use client";

import { Banknote, CheckCircle2, MapPin, Smartphone, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ProductImage } from "@/components/marketplace/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMounted } from "@/hooks/use-mounted";
import { formatCurrency } from "@/lib/formatters";
import { useCartStore } from "@/store";
import type { PaymentMethod } from "@/types";
import { DemoPaymentDialog } from "@/features/checkout/components/demo-payment-dialog";
import { fetchWithSession } from "@/services/http-client";

const paymentMethods = [
  { id: "orange_money", label: "Orange Money", icon: Smartphone },
  { id: "afrimoney", label: "Afrimoney", icon: Smartphone },
  { id: "card", label: "Debit or credit card", icon: WalletCards },
  { id: "cash_on_delivery", label: "Cash on delivery", icon: Banknote },
] as const;

export function CheckoutForm() {
  const router = useRouter();
  const mounted = useMounted();
  const { items, clear } = useCartStore();
  const [payment, setPayment] = useState<PaymentMethod>("cash_on_delivery");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [demoMethod, setDemoMethod] = useState<Exclude<PaymentMethod, "cash_on_delivery"> | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = new FormData(event.currentTarget);
    const response = await fetchWithSession("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod: payment,
        coupon: String(values.get("coupon") ?? ""),
        deliveryAddress: {
          label: "Delivery",
          recipientName: String(values.get("recipientName") ?? ""),
          phone: String(values.get("phone") ?? ""),
          addressLine: String(values.get("addressLine") ?? ""),
          city: String(values.get("city") ?? "Freetown"),
          landmark: String(values.get("landmark") ?? "") || null,
          latitude: null,
          longitude: null,
        },
      }),
    });
    const body = await response.json().catch(() => ({
      error: response.status === 401
        ? "Your session expired. Please sign in again."
        : "Unable to place your order right now.",
    }));
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "Unable to place your order.");
      return;
    }
    clear();
    router.replace(`/orders?placed=true&order=${encodeURIComponent(body.data.orderNumber)}`);
    router.refresh();
  }

  if (!mounted) return <div className="h-96 animate-pulse rounded-3xl bg-muted" />;
  if (!items.length) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center">
        <h2 className="text-xl font-black">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Add products before starting checkout.</p>
        <Button className="mt-5" onClick={() => router.push("/supermarkets")}>Browse supermarkets</Button>
      </div>
    );
  }

  return (
    <>
    <form className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]" onSubmit={submit}>
      <div className="min-w-0 space-y-6">
        <section className="rounded-3xl border bg-card p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><MapPin /></span>
            <div><h2 className="font-black">Delivery address</h2><p className="text-sm text-muted-foreground">Where should we bring your order?</p></div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Recipient name<Input autoComplete="name" className="mt-2 h-11" name="recipientName" required /></label>
            <label className="text-sm font-medium">Phone number<Input autoComplete="tel" className="mt-2 h-11" name="phone" placeholder="+23276000000" required /></label>
            <label className="text-sm font-medium sm:col-span-2">Street address<Input autoComplete="street-address" className="mt-2 h-11" name="addressLine" required /></label>
            <label className="text-sm font-medium">City or area<Input className="mt-2 h-11" defaultValue="Freetown" name="city" required /></label>
            <label className="text-sm font-medium">Landmark<Input className="mt-2 h-11" name="landmark" placeholder="Optional" /></label>
          </div>
        </section>
        <section className="rounded-3xl border bg-card p-5 sm:p-7">
          <h2 className="font-black">Payment method</h2>
          <p className="mt-1 text-sm text-muted-foreground">Online methods use a demonstration form and do not make a real charge.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  aria-pressed={payment === method.id}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${payment === method.id ? "border-primary bg-secondary ring-1 ring-primary" : ""}`}
                  key={method.id}
                  onClick={() => {
                    if (method.id === "cash_on_delivery") {
                      setPayment(method.id);
                      setPaymentSummary("");
                      return;
                    }
                    setDemoMethod(method.id);
                    setPaymentDialogOpen(true);
                  }}
                  type="button"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-muted"><Icon className="size-5" /></span>
                  <span className="flex-1 font-semibold">{method.label}{method.id !== "cash_on_delivery" && <span className="block text-xs font-normal text-muted-foreground">{payment === method.id && paymentSummary ? paymentSummary : "Demo payment"}</span>}</span>
                  {payment === method.id && <CheckCircle2 className="size-5 text-primary" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <aside className="h-fit min-w-0 rounded-3xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-lg font-black">Order summary</h2>
        <p className="mt-1 truncate text-xs text-muted-foreground">{items[0]?.supermarketName}</p>
        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
          {items.map((item) => (
            <div className="flex gap-3 text-sm" key={item.productId}>
              <ProductImage alt={item.name} className="size-12 shrink-0 rounded-lg" src={item.imageUrl} />
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{item.name}</p><p className="text-muted-foreground">Qty {item.quantity}</p></div>
              <span className="shrink-0 font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="my-5 border-t" />
        <label className="text-sm font-semibold" htmlFor="coupon">Coupon code</label>
        <Input className="mt-2" id="coupon" name="coupon" placeholder="Optional" />
        <p className="mt-2 text-xs text-muted-foreground">Valid promotions are calculated securely when the order is placed.</p>
        <div className="my-5 border-t" />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <p className="text-xs text-muted-foreground">Delivery fees and discounts are verified from the supermarket before payment.</p>
        </div>
        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
        <Button className="mt-5 h-12 w-full rounded-xl" disabled={pending} type="submit">
          {pending ? "Placing order…" : "Place order securely"}
        </Button>
      </aside>
    </form>
      <DemoPaymentDialog
        method={demoMethod}
        onConfirm={(summary) => {
          if (demoMethod) setPayment(demoMethod);
          setPaymentSummary(summary);
        }}
        onOpenChange={setPaymentDialogOpen}
        open={paymentDialogOpen}
      />
    </>
  );
}
