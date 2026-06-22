"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Bell, Building2, Clock3, MapPin, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VendorSupermarket } from "@/types";
import { vendorSettingsSchema } from "@/validations";

type SettingsFormInput = z.input<typeof vendorSettingsSchema>;
type SettingsFormValues = z.output<typeof vendorSettingsSchema>;

export function SettingsForm({
  supermarket,
}: {
  supermarket: VendorSupermarket;
}) {
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  const form = useForm<SettingsFormInput, unknown, SettingsFormValues>({
    resolver: zodResolver(vendorSettingsSchema),
    defaultValues: {
      name: supermarket.name,
      description: supermarket.description,
      phone: supermarket.phone,
      email: supermarket.email,
      addressLine: supermarket.addressLine,
      city: supermarket.city,
      deliveryFee: supermarket.deliveryFee,
      minimumOrderAmount: supermarket.minimumOrderAmount,
      estimatedDeliveryMinutes: supermarket.estimatedDeliveryMinutes,
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      const response = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to save settings.");
      return body.data as VendorSupermarket;
    },
    onSuccess: () => {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    },
  });

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_22rem]"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Building2 />
            </span>
            <div>
              <h3 className="font-black">Store information</h3>
              <p className="text-xs text-muted-foreground">Shown to customers in the marketplace</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Supermarket name
              <Input className="mt-2 h-10" {...form.register("name")} />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Description
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                {...form.register("description")}
              />
            </label>
            <label className="text-sm font-medium">
              Business email
              <Input className="mt-2 h-10" type="email" {...form.register("email")} />
            </label>
            <label className="text-sm font-medium">
              Phone
              <Input className="mt-2 h-10" {...form.register("phone")} />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Street address
              <Input className="mt-2 h-10" {...form.register("addressLine")} />
            </label>
            <label className="text-sm font-medium">
              City
              <Input className="mt-2 h-10" {...form.register("city")} />
            </label>
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Truck />
            </span>
            <div>
              <h3 className="font-black">Delivery settings</h3>
              <p className="text-xs text-muted-foreground">Control checkout and delivery estimates</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium">
              Delivery fee (SLE)
              <Input className="mt-2 h-10" min="0" step="0.01" type="number" {...form.register("deliveryFee")} />
            </label>
            <label className="text-sm font-medium">
              Minimum order
              <Input className="mt-2 h-10" min="0" step="0.01" type="number" {...form.register("minimumOrderAmount")} />
            </label>
            <label className="text-sm font-medium">
              Delivery time (min)
              <Input className="mt-2 h-10" min="1" type="number" {...form.register("estimatedDeliveryMinutes")} />
            </label>
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <Bell />
              </span>
              <div>
                <h3 className="font-black">New order notifications</h3>
                <p className="text-xs text-muted-foreground">Receive alerts when a customer places an order</p>
              </div>
            </div>
            <button
              aria-checked={notifications}
              className={`relative h-7 w-12 rounded-full transition ${notifications ? "bg-primary" : "bg-muted"}`}
              onClick={() => setNotifications((value) => !value)}
              role="switch"
              type="button"
            >
              <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${notifications ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </section>
      </div>
      <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm xl:sticky xl:top-24">
        <div className="flex items-center justify-between">
          <h3 className="font-black">Store status</h3>
          <Badge>{supermarket.status}</Badge>
        </div>
        <div className="mt-5 space-y-4 text-sm">
          <p className="flex items-center gap-3"><MapPin className="size-4 text-primary" />{supermarket.city}</p>
          <p className="flex items-center gap-3"><Clock3 className="size-4 text-primary" />Approx. {supermarket.estimatedDeliveryMinutes} minutes</p>
          <p className="rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
            Store approval and ownership transfers are managed by QuickMart administrators.
          </p>
        </div>
        {mutation.error && <p className="mt-4 text-sm text-destructive">{mutation.error.message}</p>}
        <Button className="mt-5 w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Saving…" : saved ? "Changes saved" : "Save settings"}
        </Button>
      </aside>
    </form>
  );
}
