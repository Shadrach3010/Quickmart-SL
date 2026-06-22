import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminDeliveryStatus,
  DeliveryDashboardData,
  DeliveryJob,
} from "@/types";

function name(row: { first_name: string | null; last_name: string | null }) {
  return `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Unnamed";
}

async function context() {
  const { profile } = await requireRole(USER_ROLES.DELIVERY_AGENT);
  const client = await getSupabaseServerClient();
  const agents = await client.request<Array<{
    id: string;
    profile_id: string;
    status: DeliveryDashboardData["agent"]["status"];
    vehicle_type: string | null;
    vehicle_registration: string | null;
    max_active_deliveries: number;
  }>>(
    `/rest/v1/delivery_agents?profile_id=eq.${profile.id}&select=id,profile_id,status,vehicle_type,vehicle_registration,max_active_deliveries&limit=1`,
  );
  if (!agents[0]) {
    throw new Error("This delivery account has not been provisioned.");
  }
  return { client, profile, agent: agents[0] };
}

export async function getDeliveryDashboard(): Promise<DeliveryDashboardData> {
  const value = await context();
  const admin = getSupabaseAdminClient();
  const rows = await admin.request<Array<{
    id: string;
    status: AdminDeliveryStatus;
    delivery_fee: number | string;
    delivery_address: Record<string, unknown>;
    created_at: string;
    orders: null | {
      order_number: string;
      profiles: null | {
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
      };
      supermarkets: null | { name: string };
    };
  }>>(
    `/rest/v1/deliveries?delivery_agent_id=eq.${value.agent.id}&select=id,status,delivery_fee,delivery_address,created_at,orders(order_number,profiles(first_name,last_name,phone),supermarkets(name))&order=created_at.desc`,
  );

  const jobs = rows.flatMap((row): DeliveryJob[] => {
    const order = row.orders;
    if (!order) {
      console.error("Assigned delivery is missing its related order", {
        deliveryId: row.id,
        agentId: value.agent.id,
      });
      return [];
    }
    const customer = order.profiles;
    return [{
      id: row.id,
      orderNumber: order.order_number,
      supermarket: order.supermarkets?.name ?? "Supermarket unavailable",
      customer: customer ? name(customer) : "Customer",
      customerPhone: customer?.phone ?? null,
      area: String(row.delivery_address.area ?? row.delivery_address.city ?? "Freetown"),
      address: String(row.delivery_address.address_line ?? row.delivery_address.address ?? "Address unavailable"),
      status: row.status,
      fee: Number(row.delivery_fee),
      createdAt: row.created_at,
    }];
  });

  return {
    agent: {
      id: value.agent.id,
      profileId: value.profile.id,
      name: `${value.profile.firstName ?? ""} ${value.profile.lastName ?? ""}`.trim() || "Delivery agent",
      phone: value.profile.phone,
      status: value.agent.status,
      vehicleType: value.agent.vehicle_type,
      vehicleRegistration: value.agent.vehicle_registration,
      maxActiveDeliveries: value.agent.max_active_deliveries,
    },
    jobs,
  };
}

export async function updateOwnDeliveryStatus(
  deliveryId: string,
  status: "picked_up" | "in_transit" | "delivered" | "failed",
) {
  const value = await context();
  const admin = getSupabaseAdminClient();
  const current = await admin.request<Array<{
    id: string;
    order_id: string;
    status: AdminDeliveryStatus;
    delivery_agent_id: string | null;
    orders: null | { customer_profile_id: string; order_number: string };
  }>>(
    `/rest/v1/deliveries?id=eq.${encodeURIComponent(deliveryId)}&delivery_agent_id=eq.${value.agent.id}&select=id,order_id,status,delivery_agent_id,orders(customer_profile_id,order_number)&limit=1`,
  );
  if (!current[0]) throw new Error("Delivery not found or not assigned to you.");
  if (!current[0].orders) throw new Error("The order linked to this delivery could not be found.");
  const allowed: Partial<Record<AdminDeliveryStatus, AdminDeliveryStatus[]>> = {
    assigned: ["picked_up", "failed"],
    picked_up: ["in_transit", "failed"],
    in_transit: ["delivered", "failed"],
  };
  if (!allowed[current[0].status]?.includes(status)) throw new Error("This delivery status transition is not allowed.");
  const timestamps = {
    picked_up: { picked_up_at: new Date().toISOString() },
    in_transit: {},
    delivered: { delivered_at: new Date().toISOString() },
    failed: { failed_at: new Date().toISOString(), failure_reason: "Delivery attempt failed" },
  };
  await admin.request(`/rest/v1/deliveries?id=eq.${deliveryId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status, ...timestamps[status] }),
  });
  if (status === "picked_up" || status === "in_transit" || status === "delivered") {
    await admin.request(`/rest/v1/orders?id=eq.${current[0].order_id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status: status === "delivered" ? "delivered" : "out_for_delivery",
        ...(status === "delivered" && { delivered_at: new Date().toISOString() }),
      }),
    });
    const orderStatus = status === "delivered" ? "delivered" : "out_for_delivery";
    await Promise.all([
      admin.request("/rest/v1/order_status_events", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          order_id: current[0].order_id,
          status: orderStatus,
          title: orderStatus === "delivered" ? "Delivered" : "Out for delivery",
          description: orderStatus === "delivered" ? "Your order was delivered." : "Your order is on the way.",
          created_by_profile_id: value.profile.id,
        }),
      }),
      admin.request("/rest/v1/notifications", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          profile_id: current[0].orders.customer_profile_id,
          type: "delivery",
          title: orderStatus === "delivered" ? "Order delivered" : "Order on the way",
          body: `Order ${current[0].orders.order_number} is ${orderStatus === "delivered" ? "delivered" : "out for delivery"}.`,
          data: { order_id: current[0].order_id, href: "/orders" },
        }),
      }),
    ]);
  }
  if (status === "delivered" || status === "failed") {
    const active = await admin.request<Array<{ id: string }>>(
      `/rest/v1/deliveries?delivery_agent_id=eq.${value.agent.id}&status=in.(assigned,picked_up,in_transit)&select=id`,
    );
    await admin.request(`/rest/v1/delivery_agents?id=eq.${value.agent.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: active.length ? "busy" : "available" }),
    });
  }
  return { id: deliveryId, status };
}
