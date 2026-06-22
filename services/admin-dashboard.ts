import "server-only";

import { setUserRole } from "@/lib/auth/role-management";
import { requireRole } from "@/lib/auth/guards";
import { ROLE_IDS, USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminDelivery,
  AdminDeliveryAgent,
  AdminAnalytics,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminSupermarket,
  AdminUser,
  AppRole,
  PlatformSettings,
} from "@/types";

const encode = (value: string) => encodeURIComponent(value);
const fullName = (row: { first_name: string | null; last_name: string | null }) =>
  `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Unnamed user";
const first = <T>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

async function adminClient() {
  await requireRole(USER_ROLES.ADMIN);
  return getSupabaseServerClient();
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    id: string; auth_user_id: string; email: string; first_name: string | null;
    last_name: string | null; phone: string | null; is_active: boolean;
    created_at: string; roles: { name: AppRole } | Array<{ name: AppRole }>;
  }>>("/rest/v1/profiles?select=id,auth_user_id,email,first_name,last_name,phone,is_active,created_at,roles(name)&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id, authUserId: row.auth_user_id, name: fullName(row), email: row.email,
    phone: row.phone, role: first(row.roles)?.name ?? "customer",
    isActive: row.is_active, createdAt: row.created_at,
  }));
}

export async function updateAdminUser(
  id: string,
  input: { role?: AppRole; isActive?: boolean },
) {
  const client = await adminClient();
  const current = await client.request<Array<{
    auth_user_id: string;
    roles: { name: AppRole } | Array<{ name: AppRole }>;
  }>>(
    `/rest/v1/profiles?id=eq.${encode(id)}&select=auth_user_id,roles(name)&limit=1`,
  );
  if (!current[0]) throw new Error("User not found.");
  const currentRole = first(current[0].roles)?.name;
  if (currentRole === USER_ROLES.ADMIN && input.role && input.role !== USER_ROLES.ADMIN) {
    const admins = await client.request<Array<{ id: string }>>(
      `/rest/v1/profiles?role_id=eq.${ROLE_IDS.admin}&is_active=eq.true&select=id`,
    );
    if (admins.length <= 1) {
      throw new Error("The final active administrator cannot be demoted.");
    }
  }
  if (input.role) await setUserRole(current[0].auth_user_id, input.role);
  const targetProfile = (await client.request<Array<{ id: string }>>(
    `/rest/v1/profiles?id=eq.${encode(id)}&select=id&limit=1`,
  ))[0];
  if (input.role === USER_ROLES.DELIVERY_AGENT && targetProfile) {
    await client.request("/rest/v1/delivery_agents?on_conflict=profile_id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({
        profile_id: targetProfile.id,
        status: "available",
        max_active_deliveries: 3,
      }),
    });
  } else if (input.role && input.role !== USER_ROLES.DELIVERY_AGENT && targetProfile) {
    await client.request(
      `/rest/v1/delivery_agents?profile_id=eq.${encode(targetProfile.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "suspended" }),
      },
    );
  }
  if (input.isActive !== undefined) {
    await client.request(`/rest/v1/profiles?id=eq.${encode(id)}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ is_active: input.isActive }),
    });
  }
  return (await getAdminUsers()).find((item) => item.id === id);
}

export async function getAdminSupermarkets(): Promise<AdminSupermarket[]> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    id: string; name: string; owner_profile_id: string | null; city: string;
    status: AdminSupermarket["status"]; created_at: string;
    profiles: { first_name: string | null; last_name: string | null } | null;
    products: Array<{ id: string }>; orders: Array<{ total_amount: number | string }>;
  }>>("/rest/v1/supermarkets?select=id,name,owner_profile_id,city,status,created_at,profiles(first_name,last_name),products(id),orders(total_amount)&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id, name: row.name, ownerName: row.profiles ? fullName(row.profiles) : "Unassigned",
    ownerProfileId: row.owner_profile_id, city: row.city, status: row.status,
    productCount: row.products?.length ?? 0, orderCount: row.orders?.length ?? 0,
    revenue: (row.orders ?? []).reduce((sum, order) => sum + Number(order.total_amount), 0),
    createdAt: row.created_at,
  }));
}

export async function updateAdminSupermarket(
  id: string,
  input: {
    status?: AdminSupermarket["status"];
    ownerProfileId?: string | null;
  },
) {
  const client = await adminClient();
  await client.request(`/rest/v1/supermarkets?id=eq.${encode(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      ...(input.status !== undefined && { status: input.status }),
      ...(input.ownerProfileId !== undefined && {
        owner_profile_id: input.ownerProfileId,
      }),
    }),
  });
  return (await getAdminSupermarkets()).find((item) => item.id === id);
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    id: string; name: string; sku: string | null; price: number | string;
    stock_quantity: number; is_active: boolean; created_at: string;
    supermarkets: { name: string }; categories: { name: string } | null;
  }>>("/rest/v1/products?select=id,name,sku,price,stock_quantity,is_active,created_at,supermarkets(name),categories(name)&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id, name: row.name, sku: row.sku, supermarket: row.supermarkets.name,
    category: row.categories?.name ?? "Uncategorised", price: Number(row.price),
    stock: row.stock_quantity, isActive: row.is_active, createdAt: row.created_at,
  }));
}

export async function bulkUpdateAdminProducts(ids: string[], isActive: boolean) {
  const client = await adminClient();
  await client.request(`/rest/v1/products?id=in.(${ids.map(encode).join(",")})`, {
    method: "PATCH", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ is_active: isActive }),
  });
  return ids;
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    id: string; order_number: string; status: AdminOrder["status"]; payment_method: string;
    total_amount: number | string; created_at: string;
    profiles: { first_name: string | null; last_name: string | null };
    supermarkets: { name: string };
  }>>("/rest/v1/orders?select=id,order_number,status,payment_method,total_amount,created_at,profiles(first_name,last_name),supermarkets(name)&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id, orderNumber: row.order_number, customer: fullName(row.profiles),
    supermarket: row.supermarkets.name, status: row.status,
    paymentMethod: row.payment_method.replaceAll("_", " "), total: Number(row.total_amount),
    createdAt: row.created_at,
  }));
}

export async function getAdminPayments(): Promise<AdminPayment[]> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    id: string; method: string; status: AdminPayment["status"]; amount: number | string;
    provider: string | null; provider_reference: string | null; created_at: string;
    orders: { order_number: string };
  }>>("/rest/v1/payments?select=id,method,status,amount,provider,provider_reference,created_at,orders(order_number)&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id, orderNumber: row.orders.order_number, provider: row.provider ?? "Manual",
    method: row.method.replaceAll("_", " "), status: row.status, amount: Number(row.amount),
    providerReference: row.provider_reference, createdAt: row.created_at,
  }));
}

export async function getAdminDeliveryAgents(): Promise<AdminDeliveryAgent[]> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    id: string; profile_id: string; status: AdminDeliveryAgent["status"];
    profiles: { first_name: string | null; last_name: string | null; phone: string | null };
    deliveries: Array<{ id: string }>;
  }>>("/rest/v1/delivery_agents?select=id,profile_id,status,profiles(first_name,last_name,phone),deliveries(id)&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id, profileId: row.profile_id, name: fullName(row.profiles), phone: row.profiles.phone,
    status: row.status, activeDeliveries: row.deliveries?.length ?? 0,
  }));
}

export async function getAdminDeliveries(): Promise<AdminDelivery[]> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    id: string; status: AdminDelivery["status"]; delivery_agent_id: string | null;
    delivery_address: Record<string, unknown>; created_at: string;
    orders: { order_number: string; profiles: { first_name: string | null; last_name: string | null } };
    delivery_agents: null | { profiles: { first_name: string | null; last_name: string | null } };
  }>>("/rest/v1/deliveries?select=id,status,delivery_agent_id,delivery_address,created_at,orders(order_number,profiles(first_name,last_name)),delivery_agents(profiles(first_name,last_name))&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id, orderNumber: row.orders.order_number, customer: fullName(row.orders.profiles),
    area: String(row.delivery_address.area ?? row.delivery_address.city ?? "Freetown"),
    status: row.status, agentId: row.delivery_agent_id,
    agentName: row.delivery_agents ? fullName(row.delivery_agents.profiles) : null,
    createdAt: row.created_at,
  }));
}

export async function assignAdminDelivery(id: string, agentId: string) {
  const client = await adminClient();
  const [delivery, agent, active] = await Promise.all([
    client.request<Array<{ id: string; status: AdminDelivery["status"] }>>(
      `/rest/v1/deliveries?id=eq.${encode(id)}&select=id,status&limit=1`,
    ),
    client.request<Array<{ id: string; status: AdminDeliveryAgent["status"]; max_active_deliveries: number }>>(
      `/rest/v1/delivery_agents?id=eq.${encode(agentId)}&select=id,status,max_active_deliveries&limit=1`,
    ),
    client.request<Array<{ id: string }>>(
      `/rest/v1/deliveries?delivery_agent_id=eq.${encode(agentId)}&status=in.(assigned,picked_up,in_transit)&select=id`,
    ),
  ]);
  if (!delivery[0]) throw new Error("Delivery not found.");
  if (!["unassigned", "assigned"].includes(delivery[0].status)) {
    throw new Error("Only unassigned or reassigned deliveries can be allocated.");
  }
  if (!agent[0] || !["available", "busy"].includes(agent[0].status)) {
    throw new Error("The selected delivery agent is unavailable.");
  }
  if (active.length >= agent[0].max_active_deliveries) {
    throw new Error("The selected delivery agent has reached their active-delivery limit.");
  }
  await client.request(`/rest/v1/deliveries?id=eq.${encode(id)}`, {
    method: "PATCH", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ delivery_agent_id: agentId, status: "assigned", assigned_at: new Date().toISOString() }),
  });
  await client.request(`/rest/v1/delivery_agents?id=eq.${encode(agentId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status: "busy" }),
  });
  return { id, agentId };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const client = await adminClient();
  const rows = await client.request<Array<{
    commission_rate: number | string; service_fee: number | string;
    minimum_order_amount: number | string; support_email: string;
    support_phone: string; maintenance_mode: boolean;
  }>>("/rest/v1/platform_settings?select=*&singleton=eq.true&limit=1");
  const row = rows[0];
  if (!row) {
    throw new Error("Platform settings have not been initialized.");
  }
  return {
    commissionRate: Number(row.commission_rate), serviceFee: Number(row.service_fee),
    minimumOrderAmount: Number(row.minimum_order_amount), supportEmail: row.support_email,
    supportPhone: row.support_phone, maintenanceMode: row.maintenance_mode,
  };
}

export async function updatePlatformSettings(input: PlatformSettings) {
  const client = await adminClient();
  await client.request("/rest/v1/platform_settings?singleton=eq.true", {
    method: "PATCH", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      commission_rate: input.commissionRate, service_fee: input.serviceFee,
      minimum_order_amount: input.minimumOrderAmount, support_email: input.supportEmail,
      support_phone: input.supportPhone, maintenance_mode: input.maintenanceMode,
    }),
  });
  return input;
}

export async function getAdminDashboard() {
  await requireRole(USER_ROLES.ADMIN);
  const [users, supermarkets, orders, payments, settings] = await Promise.all([
    getAdminUsers(), getAdminSupermarkets(), getAdminOrders(), getAdminPayments(), getPlatformSettings(),
  ]);
  const revenue = payments.filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const trendMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const label = order.createdAt.slice(0, 10);
    const value = trendMap.get(label) ?? { revenue: 0, orders: 0 };
    value.orders += 1;
    if (order.status !== "cancelled") value.revenue += order.total;
    trendMap.set(label, value);
  }
  const statusMap = new Map<string, number>();
  for (const order of orders) statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
  const analytics: AdminAnalytics = {
    trend: [...trendMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-30)
      .map(([label, value]) => ({
        label,
        revenue: value.revenue,
        commissions: value.revenue * (settings.commissionRate / 100),
        orders: value.orders,
      })),
    orderStatus: [...statusMap.entries()].map(([name, value]) => ({ name, value })),
    supermarketRevenue: supermarkets
      .map((store) => ({ name: store.name, revenue: store.revenue }))
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 10),
  };
  return {
    metrics: {
      totalUsers: users.length, totalSupermarkets: supermarkets.length, totalOrders: orders.length,
      revenue, commissions: revenue * (settings.commissionRate / 100),
      userChange: 0, supermarketChange: 0, orderChange: 0, revenueChange: 0,
    },
    analytics,
    orders: orders.slice(0, 6),
    payments: payments.slice(0, 5),
  };
}
