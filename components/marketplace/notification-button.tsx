"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationButton() {
  const { data = [] } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (response.status === 401) return [] as Array<{ id: string; read_at: string | null }>;
      if (!response.ok) throw new Error("Unable to load notifications.");
      return (await response.json()).data as Array<{ id: string; read_at: string | null }>;
    },
    staleTime: 30_000,
  });
  const unread = data.filter((notification) => !notification.read_at).length;
  return (
    <Link aria-label={`${unread} unread notifications`} className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "relative rounded-full")} href="/notifications">
      <Bell />
      {unread > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-rose-600 text-[9px] font-black text-white">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );
}
