"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bike, MapPin, PackageCheck, Phone, Truck } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import { fetchWithSession } from "@/services/http-client";
import type { DeliveryDashboardData, DeliveryJob } from "@/types";

export function DeliveryDashboard({ initial }: { initial: DeliveryDashboardData }) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "picked_up" | "in_transit" | "delivered" | "failed";
    }) => {
      const response = await fetchWithSession(`/api/delivery/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Update failed.");
      return body.data as Pick<DeliveryJob, "id" | "status">;
    },
    onSuccess: (updated) =>
      client.setQueryData<DeliveryDashboardData>(
        queryKeys.delivery.dashboard,
        (current = initial) => ({
          ...current,
          jobs: current.jobs.map((job) =>
            job.id === updated.id ? { ...job, status: updated.status } : job,
          ),
        }),
      ),
  });
  const data =
    client.getQueryData<DeliveryDashboardData>(queryKeys.delivery.dashboard) ??
    initial;
  const active = data.jobs.filter((job) => job.status !== "delivered" && job.status !== "failed");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#10261b] p-6 text-white md:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><p className="text-sm text-emerald-300">Delivery centre</p><h1 className="mt-1 text-3xl font-black">{data.agent.name}</h1><p className="mt-2 text-sm text-white/60">{data.agent.vehicleType ?? "Vehicle not set"} {data.agent.vehicleRegistration ? `· ${data.agent.vehicleRegistration}` : ""}</p></div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"><Bike className="text-emerald-300" /><div><p className="text-xs text-white/60">Availability</p><p className="font-bold capitalize">{data.agent.status}</p></div></div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent><p className="text-xs font-bold uppercase text-muted-foreground">Active deliveries</p><p className="mt-2 text-3xl font-black">{active.length}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs font-bold uppercase text-muted-foreground">Capacity</p><p className="mt-2 text-3xl font-black">{data.agent.maxActiveDeliveries}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs font-bold uppercase text-muted-foreground">Delivery earnings</p><p className="mt-2 text-3xl font-black">{formatCurrency(data.jobs.reduce((sum, job) => sum + (job.status === "delivered" ? job.fee : 0), 0))}</p></CardContent></Card>
      </div>
      <div>
        <h2 className="text-xl font-black">Assigned deliveries</h2>
        <div className="mt-4 space-y-4">
          {data.jobs.length ? data.jobs.map((job) => (
            <article className="rounded-2xl border bg-card p-5 shadow-sm" key={job.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div><div className="flex items-center gap-2"><h3 className="font-black">{job.orderNumber}</h3><StatusBadge status={job.status} /></div><p className="mt-1 text-sm text-muted-foreground">{job.supermarket} · {formatDate(job.createdAt)}</p></div>
                <p className="font-black">{formatCurrency(job.fee)}</p>
              </div>
              <div className="mt-4 grid gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:grid-cols-2"><p className="flex gap-2"><MapPin className="size-4 shrink-0 text-primary" /> {job.address}, {job.area}</p><p className="flex gap-2"><Phone className="size-4 shrink-0 text-primary" /> {job.customer} · {job.customerPhone ?? "No phone"}</p></div>
              {!["delivered", "failed"].includes(job.status) && <div className="mt-4 flex flex-wrap gap-2">
                {job.status === "assigned" && <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ id: job.id, status: "picked_up" })} size="sm"><PackageCheck /> Mark picked up</Button>}
                {job.status === "picked_up" && <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ id: job.id, status: "in_transit" })} size="sm"><Truck /> Start delivery</Button>}
                {job.status === "in_transit" && <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ id: job.id, status: "delivered" })} size="sm"><PackageCheck /> Mark delivered</Button>}
                <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ id: job.id, status: "failed" })} size="sm" variant="outline">Report issue</Button>
              </div>}
            </article>
          )) : <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No deliveries are assigned to you yet.</div>}
        </div>
      </div>
    </div>
  );
}
