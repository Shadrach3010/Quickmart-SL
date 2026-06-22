"use client";

import { Check, Copy, Gift, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import type { ReferralSummary } from "@/types";

export function ReferralCard({ summary }: { summary: ReferralSummary }) {
  const [copied, setCopied] = useState(false);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${origin}/sign-up?ref=${summary.code}`;
  return (
    <section className="rounded-3xl border bg-gradient-to-br from-[#143d2a] to-[#216d49] p-5 text-white md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-semibold text-emerald-200">Give SLE 25, get SLE 25</p><h2 className="mt-1 text-2xl font-black">Invite friends to QuickMart</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Rewards are recorded after a referred customer completes a qualifying delivery.</p></div>
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10"><Gift /></span>
      </div>
      <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row">
        <input aria-label="Referral link" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none" readOnly value={link} />
        <Button onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy link"}</Button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-3"><Users className="mx-auto size-4 text-emerald-200" /><p className="mt-1 text-xl font-black">{summary.successfulReferrals}</p><p className="text-[10px] text-white/60">Successful</p></div>
        <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">{summary.pendingReferrals}</p><p className="text-[10px] text-white/60">Pending</p></div>
        <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">{formatCurrency(summary.rewardsEarned)}</p><p className="text-[10px] text-white/60">Earned</p></div>
      </div>
    </section>
  );
}
