"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle2, MoreHorizontal, Power, PowerOff, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminBulkButton, AdminDataGrid, type AdminColumn } from "@/components/admin/admin-data-grid";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminDelivery, AdminDeliveryAgent, AdminOrder, AdminPayment, AdminProduct,
  AdminSupermarket, AdminUser, AppRole,
} from "@/types";

async function json<T>(response: Response | Promise<Response>): Promise<T> {
  const resolved = await response;
  const body = await resolved.json();
  if (!resolved.ok) throw new Error(body.error ?? "Request failed.");
  return body.data as T;
}

const date = (value: string) => formatDate(value, { dateStyle: "medium" });
const selectClass = "h-8 rounded-lg border bg-white px-2 text-xs font-semibold capitalize outline-none";

export function UsersManager({ initial }: { initial: AdminUser[] }) {
  const client = useQueryClient();
  const { data = initial } = useQuery({
    initialData: initial, queryKey: queryKeys.admin.users,
    queryFn: () => json<AdminUser[]>(fetch("/api/admin/users")),
  });
  const mutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<AdminUser, "role" | "isActive">> }) =>
      json<AdminUser>(fetch(`/api/admin/users/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
      })),
    onSuccess: (user) => client.setQueryData<AdminUser[]>(queryKeys.admin.users, (rows = []) =>
      rows.map((row) => row.id === user.id ? user : row)),
  });
  const columns: AdminColumn<AdminUser>[] = [
    { label: "User", render: (user) => <div><p className="font-semibold">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div> },
    { label: "Phone", render: (user) => user.phone ?? "—" },
    { label: "Role", render: (user) => (
      <select className={selectClass} disabled={mutation.isPending} onChange={(e) => mutation.mutate({ id: user.id, patch: { role: e.target.value as AppRole } })} value={user.role}>
        <option value="customer">Customer</option><option value="vendor">Vendor</option>
        <option value="delivery_agent">Delivery agent</option><option value="admin">Admin</option>
      </select>
    ) },
    { label: "Status", render: (user) => <StatusBadge status={user.isActive ? "active" : "suspended"} /> },
    { label: "Joined", render: (user) => date(user.createdAt) },
  ];
  return <AdminDataGrid
    bulkActions={(selected, clear) => (<>
      <AdminBulkButton onClick={() => { selected.forEach((user) => mutation.mutate({ id: user.id, patch: { isActive: true } })); clear(); }}><CheckCircle2 /> Activate</AdminBulkButton>
      <AdminBulkButton onClick={() => { selected.forEach((user) => mutation.mutate({ id: user.id, patch: { isActive: false } })); clear(); }}><Ban /> Suspend</AdminBulkButton>
    </>)}
    columns={columns}
    filter={(user) => user.role}
    filterOptions={[
      { label: "Customers", value: "customer" }, { label: "Vendors", value: "vendor" },
      { label: "Delivery agents", value: "delivery_agent" }, { label: "Admins", value: "admin" },
    ]}
    rowAction={(user) => <Button aria-label="Toggle account status" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: user.id, patch: { isActive: !user.isActive } })} size="icon" variant="ghost">{user.isActive ? <PowerOff /> : <Power />}</Button>}
    rows={data} search={(user) => `${user.name} ${user.email} ${user.phone ?? ""}`} searchPlaceholder="Search name, email, or phone" selectable
  />;
}

export function SupermarketsManager({
  initial,
  vendors,
}: {
  initial: AdminSupermarket[];
  vendors: AdminUser[];
}) {
  const client = useQueryClient();
  const { data = initial } = useQuery({
    initialData: initial, queryKey: queryKeys.admin.supermarkets,
    queryFn: () => json<AdminSupermarket[]>(fetch("/api/admin/supermarkets")),
  });
  const mutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { status?: AdminSupermarket["status"]; ownerProfileId?: string | null } }) =>
      json<AdminSupermarket>(fetch(`/api/admin/supermarkets/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
      })),
    onSuccess: (store) => client.setQueryData<AdminSupermarket[]>(queryKeys.admin.supermarkets, (rows = []) =>
      rows.map((row) => row.id === store.id ? store : row)),
  });
  const columns: AdminColumn<AdminSupermarket>[] = [
    { label: "Supermarket", render: (store) => <div><p className="font-semibold">{store.name}</p><p className="text-xs text-muted-foreground">{store.city}</p></div> },
    { label: "Vendor", render: (store) => (
      <select
        aria-label={`Assign vendor for ${store.name}`}
        className={selectClass}
        disabled={mutation.isPending}
        onChange={(event) => mutation.mutate({
          id: store.id,
          patch: { ownerProfileId: event.target.value || null },
        })}
        value={store.ownerProfileId ?? ""}
      >
        <option value="">Unassigned</option>
        {vendors.map((vendor) => (
          <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
        ))}
      </select>
    ) },
    { label: "Products", render: (store) => formatNumber(store.productCount) },
    { label: "Orders", render: (store) => formatNumber(store.orderCount) },
    { label: "Revenue", render: (store) => <span className="font-semibold">{formatCurrency(store.revenue)}</span> },
    { label: "Status", render: (store) => <StatusBadge status={store.status} /> },
  ];
  return <AdminDataGrid
    columns={columns} filter={(store) => store.status}
    filterOptions={["pending", "active", "suspended", "closed"].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))}
    rowAction={(store) => <select aria-label={`Update ${store.name} status`} className={selectClass} disabled={mutation.isPending} onChange={(e) => mutation.mutate({ id: store.id, patch: { status: e.target.value as AdminSupermarket["status"] } })} value={store.status}><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="closed">Closed</option></select>}
    rows={data} search={(store) => `${store.name} ${store.ownerName} ${store.city}`} searchPlaceholder="Search supermarkets or vendors"
  />;
}

export function ProductsManager({ initial }: { initial: AdminProduct[] }) {
  const client = useQueryClient();
  const { data = initial } = useQuery({
    initialData: initial, queryKey: queryKeys.admin.products,
    queryFn: () => json<AdminProduct[]>(fetch("/api/admin/products")),
  });
  const mutation = useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      json<string[]>(fetch("/api/admin/products/bulk", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, isActive }),
      })),
    onSuccess: (ids, variables) => client.setQueryData<AdminProduct[]>(queryKeys.admin.products, (rows = []) =>
      rows.map((row) => ids.includes(row.id) ? { ...row, isActive: variables.isActive } : row)),
  });
  const columns: AdminColumn<AdminProduct>[] = [
    { label: "Product", render: (product) => <div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{product.sku ?? "No SKU"}</p></div> },
    { label: "Supermarket", render: (product) => product.supermarket },
    { label: "Category", render: (product) => product.category },
    { label: "Price", render: (product) => <span className="font-semibold">{formatCurrency(product.price)}</span> },
    { label: "Stock", render: (product) => <span className={product.stock <= 5 ? "font-bold text-rose-600" : ""}>{product.stock}</span> },
    { label: "Status", render: (product) => <StatusBadge status={product.isActive ? "active" : "suspended"} /> },
  ];
  return <AdminDataGrid
    bulkActions={(selected, clear) => (<>
      <AdminBulkButton disabled={mutation.isPending} onClick={() => { mutation.mutate({ ids: selected.map(({ id }) => id), isActive: true }); clear(); }}><Power /> Activate</AdminBulkButton>
      <AdminBulkButton disabled={mutation.isPending} onClick={() => { mutation.mutate({ ids: selected.map(({ id }) => id), isActive: false }); clear(); }}><PowerOff /> Deactivate</AdminBulkButton>
    </>)}
    columns={columns} filter={(product) => product.isActive ? "active" : "inactive"}
    filterOptions={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]}
    rows={data} search={(product) => `${product.name} ${product.sku ?? ""} ${product.supermarket} ${product.category}`} searchPlaceholder="Search products, SKU, or supermarket" selectable
  />;
}

export function OrdersManager({ initial }: { initial: AdminOrder[] }) {
  const { data = initial } = useQuery({
    initialData: initial, queryKey: queryKeys.admin.orders,
    queryFn: () => json<AdminOrder[]>(fetch("/api/admin/orders")),
  });
  const [viewing, setViewing] = useState<AdminOrder | null>(null);
  const columns: AdminColumn<AdminOrder>[] = [
    { label: "Order", render: (order) => <span className="font-mono text-xs font-semibold">{order.orderNumber}</span> },
    { label: "Customer", render: (order) => order.customer },
    { label: "Supermarket", render: (order) => order.supermarket },
    { label: "Status", render: (order) => <StatusBadge status={order.status} /> },
    { label: "Total", render: (order) => <span className="font-semibold">{formatCurrency(order.total)}</span> },
    { label: "Placed", render: (order) => date(order.createdAt) },
  ];
  return <><AdminDataGrid columns={columns} filter={(order) => order.status}
    filterOptions={["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((value) => ({ label: value.replaceAll("_", " "), value }))}
    rowAction={(order) => <Button onClick={() => setViewing(order)} size="icon" variant="ghost"><MoreHorizontal /></Button>}
    rows={data} search={(order) => `${order.orderNumber} ${order.customer} ${order.supermarket}`} searchPlaceholder="Search order, customer, or supermarket" />
    <Dialog onOpenChange={(open) => !open && setViewing(null)} open={Boolean(viewing)}>
      <DialogContent><DialogHeader><DialogTitle>{viewing?.orderNumber}</DialogTitle><DialogDescription>Platform-wide order details</DialogDescription></DialogHeader>
        {viewing && <div className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Customer</p><p className="font-semibold">{viewing.customer}</p></div><div><p className="text-muted-foreground">Supermarket</p><p className="font-semibold">{viewing.supermarket}</p></div><div><p className="text-muted-foreground">Payment</p><p className="font-semibold capitalize">{viewing.paymentMethod}</p></div><div><p className="text-muted-foreground">Total</p><p className="font-semibold">{formatCurrency(viewing.total)}</p></div></div>}
      </DialogContent>
    </Dialog>
  </>;
}

export function PaymentsManager({ initial }: { initial: AdminPayment[] }) {
  const { data = initial } = useQuery({
    initialData: initial, queryKey: queryKeys.admin.payments,
    queryFn: () => json<AdminPayment[]>(fetch("/api/admin/payments")),
  });
  const columns: AdminColumn<AdminPayment>[] = [
    { label: "Reference", render: (payment) => <div><p className="font-mono text-xs font-semibold">{payment.providerReference ?? "Manual"}</p><p className="text-xs text-muted-foreground">{payment.orderNumber}</p></div> },
    { label: "Provider", render: (payment) => payment.provider },
    { label: "Method", render: (payment) => <span className="capitalize">{payment.method}</span> },
    { label: "Status", render: (payment) => <StatusBadge status={payment.status} /> },
    { label: "Amount", render: (payment) => <span className="font-semibold">{formatCurrency(payment.amount)}</span> },
    { label: "Date", render: (payment) => date(payment.createdAt) },
  ];
  return <AdminDataGrid columns={columns} filter={(payment) => payment.status}
    filterOptions={["paid", "processing", "pending", "failed", "refunded"].map((value) => ({ label: value, value }))}
    rows={data} search={(payment) => `${payment.providerReference ?? ""} ${payment.orderNumber} ${payment.provider}`} searchPlaceholder="Search transaction or order reference" />;
}

export function DeliveriesManager({ initial, initialAgents }: { initial: AdminDelivery[]; initialAgents: AdminDeliveryAgent[] }) {
  const client = useQueryClient();
  const { data } = useQuery({
    initialData: { deliveries: initial, agents: initialAgents }, queryKey: queryKeys.admin.deliveries,
    queryFn: () => json<{ deliveries: AdminDelivery[]; agents: AdminDeliveryAgent[] }>(fetch("/api/admin/deliveries")),
  });
  const [assigning, setAssigning] = useState<AdminDelivery | null>(null);
  const [agentId, setAgentId] = useState("");
  const mutation = useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      json<{ id: string; agentId: string }>(fetch(`/api/admin/deliveries/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId }),
      })),
    onSuccess: ({ id, agentId }) => {
      const agent = data.agents.find((item) => item.id === agentId);
      client.setQueryData(queryKeys.admin.deliveries, {
        ...data, deliveries: data.deliveries.map((delivery) => delivery.id === id
          ? { ...delivery, agentId, agentName: agent?.name ?? null, status: "assigned" as const } : delivery),
      });
      setAssigning(null); setAgentId("");
    },
  });
  const columns: AdminColumn<AdminDelivery>[] = [
    { label: "Order", render: (delivery) => <span className="font-mono text-xs font-semibold">{delivery.orderNumber}</span> },
    { label: "Customer", render: (delivery) => <div><p className="font-semibold">{delivery.customer}</p><p className="text-xs text-muted-foreground">{delivery.area}</p></div> },
    { label: "Agent", render: (delivery) => delivery.agentName ?? <span className="text-amber-700">Unassigned</span> },
    { label: "Status", render: (delivery) => <StatusBadge status={delivery.status} /> },
    { label: "Created", render: (delivery) => date(delivery.createdAt) },
  ];
  const availableAgents = useMemo(() => data.agents.filter((agent) => agent.status === "available" || agent.status === "busy"), [data.agents]);
  return <><AdminDataGrid columns={columns} filter={(delivery) => delivery.status}
    filterOptions={["unassigned", "assigned", "picked_up", "in_transit", "delivered"].map((value) => ({ label: value.replaceAll("_", " "), value }))}
    rowAction={(delivery) => <Button onClick={() => { setAssigning(delivery); setAgentId(delivery.agentId ?? ""); }} size="sm" variant="outline"><Truck /> Assign</Button>}
    rows={data.deliveries} search={(delivery) => `${delivery.orderNumber} ${delivery.customer} ${delivery.agentName ?? ""} ${delivery.area}`} searchPlaceholder="Search order, customer, agent, or area" />
    <Dialog onOpenChange={(open) => !open && setAssigning(null)} open={Boolean(assigning)}>
      <DialogContent><DialogHeader><DialogTitle>Assign delivery agent</DialogTitle><DialogDescription>{assigning?.orderNumber} · {assigning?.area}</DialogDescription></DialogHeader>
        <label className="mt-5 text-sm font-medium">Available agent<select className="mt-2 h-11 w-full rounded-lg border bg-white px-3" onChange={(e) => setAgentId(e.target.value)} value={agentId}><option value="">Select an agent</option>{availableAgents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.activeDeliveries} active</option>)}</select></label>
        <Button className="mt-5 w-full" disabled={!agentId || mutation.isPending} onClick={() => assigning && mutation.mutate({ id: assigning.id, agentId })}>{mutation.isPending ? "Assigning…" : "Confirm assignment"}</Button>
      </DialogContent>
    </Dialog>
  </>;
}
