"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/query-keys";
import type { PlatformSettings } from "@/types";
import { platformSettingsSchema } from "@/validations";

type FormInput = z.input<typeof platformSettingsSchema>;
type Form = z.output<typeof platformSettingsSchema>;
async function json<T>(response: Response | Promise<Response>): Promise<T> {
  const resolved = await response;
  const body = await resolved.json();
  if (!resolved.ok) throw new Error(body.error ?? "Request failed.");
  return body.data;
}

export function AdminSettingsForm({ initial }: { initial: PlatformSettings }) {
  const client = useQueryClient();
  const { data = initial } = useQuery({
    initialData: initial, queryKey: queryKeys.admin.settings,
    queryFn: () => json<PlatformSettings>(fetch("/api/admin/settings")),
  });
  const form = useForm<FormInput, unknown, Form>({ resolver: zodResolver(platformSettingsSchema), values: data });
  const mutation = useMutation({
    mutationFn: (values: Form) => json<PlatformSettings>(fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
    })),
    onSuccess: (settings) => client.setQueryData(queryKeys.admin.settings, settings),
  });
  return <form className="grid gap-5 lg:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
    <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Commerce</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">Commission rate (%)<Input className="mt-2" min="0" step=".1" type="number" {...form.register("commissionRate")}/></label>
      <label className="text-sm font-medium">Service fee (SLE)<Input className="mt-2" min="0" step=".01" type="number" {...form.register("serviceFee")}/></label>
      <label className="text-sm font-medium sm:col-span-2">Minimum order (SLE)<Input className="mt-2" min="0" step=".01" type="number" {...form.register("minimumOrderAmount")}/></label>
    </CardContent></Card>
    <Card className="border-0 shadow-sm"><CardHeader><CardTitle>Support & availability</CardTitle></CardHeader><CardContent className="grid gap-4">
      <label className="text-sm font-medium">Support email<Input className="mt-2" type="email" {...form.register("supportEmail")}/></label>
      <label className="text-sm font-medium">Support phone<Input className="mt-2" {...form.register("supportPhone")}/></label>
      <label className="flex items-center justify-between rounded-xl border p-4 text-sm font-medium">Maintenance mode<input className="size-4" type="checkbox" {...form.register("maintenanceMode")}/></label>
    </CardContent></Card>
    <div className="flex items-center gap-3 lg:col-span-2">
      <Button disabled={mutation.isPending} type="submit">{mutation.isPending ? "Saving…" : "Save platform settings"}</Button>
      {mutation.isSuccess && <span className="text-sm font-semibold text-emerald-600">Settings saved.</span>}
      {mutation.isError && <span className="text-sm text-destructive">{mutation.error.message}</span>}
    </div>
  </form>;
}
