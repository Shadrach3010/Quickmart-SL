import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function connectSignupReferral(authUserId: string, referralCode?: string) {
  if (!referralCode) return;
  const admin = getSupabaseAdminClient();
  const [profiles, referredRows] = await Promise.all([
    admin.request<Array<{ id: string }>>("/rest/v1/profiles?select=id"),
    admin.request<Array<{ id: string }>>(
      `/rest/v1/profiles?auth_user_id=eq.${encodeURIComponent(authUserId)}&select=id&limit=1`,
    ),
  ]);
  const supplied = referralCode.toUpperCase();
  const referrer = profiles.find(
    (profile) => `QM${profile.id.replaceAll("-", "").slice(0, 10).toUpperCase()}` === supplied,
  );
  const referred = referredRows[0];
  if (!referrer || !referred || referrer.id === referred.id) return;
  await admin.request("/rest/v1/referrals?on_conflict=referred_profile_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      referrer_profile_id: referrer.id,
      referred_profile_id: referred.id,
      referral_code: supplied,
      status: "joined",
      referrer_reward_amount: 25,
      referred_reward_amount: 25,
    }),
  });
}
