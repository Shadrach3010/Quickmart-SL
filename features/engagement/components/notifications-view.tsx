"use client";

import { Bell, CheckCheck, CreditCard, Gift, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import type { MarketplaceNotification } from "@/types";

const icons = { order: PackageCheck, payment: CreditCard, delivery: Truck, promotion: Gift, system: Bell };

export function NotificationsView({ initialNotifications }: { initialNotifications: MarketplaceNotification[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  async function mark(ids: string[]) {
    setNotifications((current) => current.map((item) => ids.includes(item.id) ? { ...item, read: true } : item));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-3xl font-black tracking-tight md:text-5xl">Notifications</h1><p className="mt-2 text-muted-foreground">Order updates, delivery alerts, and offers.</p></div>
        <Button disabled={!notifications.some((item) => !item.read)} onClick={() => mark(notifications.filter((item) => !item.read).map((item) => item.id))} variant="outline"><CheckCheck /> Mark all read</Button>
      </div>
      <div className="overflow-hidden rounded-3xl border bg-card">
        {notifications.length ? notifications.map((notification) => {
          const Icon = icons[notification.type];
          const content = <div className={`flex gap-4 border-b p-4 last:border-0 sm:p-5 ${notification.read ? "" : "bg-secondary/40"}`}>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Icon /></span>
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="break-words font-bold">{notification.title}</p>{!notification.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}</div><p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{notification.body}</p><p className="mt-2 text-xs text-muted-foreground">{formatDate(notification.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p></div>
          </div>;
          return notification.href ? <Link href={notification.href} key={notification.id} onClick={() => mark([notification.id])}>{content}</Link> : <div key={notification.id}>{content}</div>;
        }) : <p className="p-8 text-center text-sm text-muted-foreground">You have no notifications.</p>}
      </div>
    </div>
  );
}
