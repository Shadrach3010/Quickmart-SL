"use client";

import { Home, MapPin, Plus, Trash2, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DeliveryAddress } from "@/types";

export function ProfileSettings({
  firstName,
  lastName,
  email,
  phone,
  addresses,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: DeliveryAddress[];
}) {
  const router = useRouter();
  const [savingProfile, setSavingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone"),
      }),
    });
    const body = await response.json();
    setSavingProfile(false);
    if (!response.ok) {
      toast.error(body.error ?? "Unable to update your profile.");
      return;
    }
    toast.success("Profile updated.");
    router.refresh();
  }

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAddress(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.get("label"),
        recipientName: form.get("recipientName"),
        phone: form.get("phone"),
        addressLine: form.get("addressLine"),
        city: form.get("city"),
        landmark: String(form.get("landmark") ?? "") || null,
        latitude: null,
        longitude: null,
      }),
    });
    const body = await response.json();
    setSavingAddress(false);
    if (!response.ok) {
      toast.error(body.error ?? "Unable to save the address.");
      return;
    }
    toast.success("Address saved.");
    setShowAddressForm(false);
    router.refresh();
  }

  async function removeAddress(id: string) {
    const response = await fetch(`/api/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to remove the address.");
      return;
    }
    toast.success("Address removed.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <nav className="h-fit rounded-2xl border bg-card p-2">
        <a className="flex w-full items-center gap-3 rounded-xl bg-secondary px-3 py-3 text-left text-sm font-semibold text-primary" href="#personal"><UserRound className="size-4" /> Personal info</a>
        <a className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-muted-foreground hover:bg-muted" href="#addresses"><MapPin className="size-4" /> Addresses</a>
      </nav>
      <div className="min-w-0 space-y-6">
        <section className="rounded-3xl border bg-card p-5 md:p-7" id="personal">
          <h2 className="text-xl font-black">Personal information</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep your delivery details up to date.</p>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
            <label className="text-sm font-medium">First name<Input className="mt-2 h-11" defaultValue={firstName} name="firstName" required /></label>
            <label className="text-sm font-medium">Last name<Input className="mt-2 h-11" defaultValue={lastName} name="lastName" required /></label>
            <label className="text-sm font-medium sm:col-span-2">Email address<Input className="mt-2 h-11" defaultValue={email} disabled /></label>
            <label className="text-sm font-medium sm:col-span-2">Phone number<Input className="mt-2 h-11" defaultValue={phone} name="phone" placeholder="+23276000000" /></label>
            <Button className="w-full sm:w-fit" disabled={savingProfile} type="submit">{savingProfile ? "Saving…" : "Save changes"}</Button>
          </form>
        </section>

        <section className="rounded-3xl border bg-card p-5 md:p-7" id="addresses">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-black">Saved addresses</h2><p className="mt-1 text-sm text-muted-foreground">Use saved addresses for faster checkout.</p></div>
            <Button onClick={() => setShowAddressForm((value) => !value)} size="sm" variant="outline">{showAddressForm ? <X /> : <Plus />}{showAddressForm ? "Cancel" : "Add address"}</Button>
          </div>
          {showAddressForm && (
            <form className="mt-5 grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2" onSubmit={addAddress}>
              <label className="text-sm font-medium">Label<Input className="mt-2 bg-card" name="label" placeholder="Home" required /></label>
              <label className="text-sm font-medium">Recipient<Input className="mt-2 bg-card" defaultValue={`${firstName} ${lastName}`.trim()} name="recipientName" required /></label>
              <label className="text-sm font-medium">Phone<Input className="mt-2 bg-card" defaultValue={phone} name="phone" required /></label>
              <label className="text-sm font-medium">City or area<Input className="mt-2 bg-card" defaultValue="Freetown" name="city" required /></label>
              <label className="text-sm font-medium sm:col-span-2">Street address<Input className="mt-2 bg-card" name="addressLine" required /></label>
              <label className="text-sm font-medium sm:col-span-2">Landmark<Input className="mt-2 bg-card" name="landmark" placeholder="Optional" /></label>
              <Button className="sm:w-fit" disabled={savingAddress} type="submit">{savingAddress ? "Saving…" : "Save address"}</Button>
            </form>
          )}
          <div className="mt-5 grid gap-3">
            {addresses.length ? addresses.map((address) => (
              <div className="flex min-w-0 gap-4 rounded-2xl border p-4" key={address.id}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Home /></span>
                <div className="min-w-0 flex-1"><p className="font-bold">{address.label}</p><p className="mt-1 break-words text-sm text-muted-foreground">{address.addressLine}, {address.city}{address.landmark ? ` · ${address.landmark}` : ""}</p></div>
                <Button aria-label={`Remove ${address.label} address`} onClick={() => removeAddress(address.id)} size="icon" variant="ghost"><Trash2 /></Button>
              </div>
            )) : <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">No saved addresses yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
