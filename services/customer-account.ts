import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DeliveryAddress, ReferralSummary } from "@/types";

export async function getCustomerAddresses(): Promise<DeliveryAddress[]> {
  await requireRole(USER_ROLES.CUSTOMER);
  const client = await getSupabaseServerClient();
  const rows = await client.request<Array<{
    id: string;
    label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    landmark: string | null;
    latitude: number | string | null;
    longitude: number | string | null;
  }>>("/rest/v1/addresses?select=id,label,recipient_name,phone,address_line,city,landmark,latitude,longitude&order=is_default.desc,created_at.desc");
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine: row.address_line,
    city: row.city,
    landmark: row.landmark,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
  }));
}

export async function getReferralSummary(): Promise<ReferralSummary> {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const client = await getSupabaseServerClient();
  const referrals = await client.request<Array<{
      status: string;
      referrer_reward_amount: number | string;
    }>>(`/rest/v1/referrals?referrer_profile_id=eq.${profile.id}&select=status,referrer_reward_amount`);
  return {
    code: `QM${profile.id.replaceAll("-", "").slice(0, 10).toUpperCase()}`,
    successfulReferrals: referrals.filter((row) => ["qualified", "rewarded"].includes(row.status)).length,
    pendingReferrals: referrals.filter((row) => ["invited", "joined"].includes(row.status)).length,
    rewardsEarned: referrals
      .filter((row) => row.status === "rewarded")
      .reduce((sum, row) => sum + Number(row.referrer_reward_amount), 0),
  };
}
