import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const client = getSupabaseAdminClient();
  const rows = await client.request<Array<{
    id: string;
    order_number: string;
    status: string;
    total_amount: number | string;
    created_at: string;
    supermarkets: null | { name: string };
    order_items: Array<{ quantity: number }>;
    order_status_events: Array<{
      id: string;
      title: string;
      description: string | null;
      location: string | null;
      created_at: string;
      status: string;
    }>;
  }>>(
    `/rest/v1/orders?customer_profile_id=eq.${encodeURIComponent(profile.id)}&select=id,order_number,status,total_amount,created_at,supermarkets(name),order_items(quantity),order_status_events(id,title,description,location,created_at,status)&order=created_at.desc&order_status_events.order=created_at.asc`,
    { cache: "no-store" },
  );

  return Response.json({
    data: rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      store: row.supermarkets?.name ?? "Supermarket unavailable",
      status: row.status,
      total: Number(row.total_amount),
      items: row.order_items.reduce((total, item) => total + item.quantity, 0),
      createdAt: row.created_at,
      events: row.order_status_events,
    })),
  });
}
