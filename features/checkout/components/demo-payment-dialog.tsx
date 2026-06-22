"use client";

import { CreditCard, ShieldCheck, Smartphone } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PaymentMethod } from "@/types";

type DemoMethod = Exclude<PaymentMethod, "cash_on_delivery">;

export function DemoPaymentDialog({
  method,
  open,
  onOpenChange,
  onConfirm,
}: {
  method: DemoMethod | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (summary: string) => void;
}) {
  const [error, setError] = useState("");
  if (!method) return null;
  const mobile = method === "orange_money" || method === "afrimoney";
  const title = method === "orange_money" ? "Orange Money" : method === "afrimoney" ? "Afrimoney" : "Card payment";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    if (mobile) {
      const phone = String(data.get("paymentPhone") ?? "").replace(/[\s()-]/g, "");
      if (!/^(?:\+?232)?(?:7[6789]|8[08]|9[09])\d{6}$/.test(phone)) {
        setError("Enter a valid Sierra Leone mobile-money number.");
        return;
      }
      onConfirm(`${title} · ${phone.slice(-4).padStart(phone.length, "•")}`);
    } else {
      const number = String(data.get("cardNumber") ?? "").replace(/\s/g, "");
      const expiry = String(data.get("expiry") ?? "");
      const cvv = String(data.get("cvv") ?? "");
      if (!/^\d{16}$/.test(number) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
        setError("Enter a 16-digit card number, MM/YY expiry, and valid security code.");
        return;
      }
      onConfirm(`Demo card ···· ${number.slice(-4)}`);
    }
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-3 grid size-11 place-items-center rounded-xl bg-secondary text-primary">
            {mobile ? <Smartphone /> : <CreditCard />}
          </div>
          <DialogTitle>{title} details</DialogTitle>
          <DialogDescription>
            Demonstration only. Nothing will be charged or sent to a payment provider.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          {mobile ? (
            <label className="mt-5 block text-sm font-semibold">
              Mobile-money number
              <Input autoComplete="tel" className="mt-2 h-11" name="paymentPhone" placeholder="+232 76 123 456" required />
            </label>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">
                Cardholder name
                <Input autoComplete="cc-name" className="mt-2 h-11" name="cardholder" required />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Card number
                <Input autoComplete="cc-number" className="mt-2 h-11" inputMode="numeric" maxLength={19} name="cardNumber" placeholder="4242 4242 4242 4242" required />
              </label>
              <label className="text-sm font-semibold">
                Expiry
                <Input autoComplete="cc-exp" className="mt-2 h-11" maxLength={5} name="expiry" placeholder="MM/YY" required />
              </label>
              <label className="text-sm font-semibold">
                Security code
                <Input autoComplete="cc-csc" className="mt-2 h-11" inputMode="numeric" maxLength={4} name="cvv" placeholder="CVV" required type="password" />
              </label>
            </div>
          )}
          <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Demo values stay in this browser form and are never stored or transmitted.
          </div>
          {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
          <DialogFooter className="flex-col-reverse sm:flex-row">
            <Button onClick={() => onOpenChange(false)} type="button" variant="outline">Cancel</Button>
            <Button type="submit">Use demo payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
