"use client";

import {
  BarChart3, Boxes, ChevronLeft, CreditCard, LayoutDashboard, Menu,
  Package, ReceiptText, Settings, ShieldCheck, Store, Truck, Users, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LayoutProps } from "@/types";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/supermarkets", label: "Supermarkets", icon: Store },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/deliveries", label: "Deliveries", icon: Truck },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function title(pathname: string) {
  return navigation.find(({ href }) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href)),
  )?.label ?? "Administration";
}

function Sidebar({ pathname, close }: { pathname: string; close?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#111827] text-white">
      <div className="border-b border-white/10 p-5">
        <Link className="flex items-center gap-3" href="/admin" onClick={close}>
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-400 text-slate-950">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="font-black tracking-tight">QuickMart SL</p>
            <p className="text-[11px] text-slate-400">Platform administration</p>
          </div>
        </Link>
      </div>
      <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
          Operations
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          All systems operational
        </p>
      </div>
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-emerald-400 text-slate-950" : "text-slate-400 hover:bg-white/8 hover:text-white",
              )}
              href={href}
              key={href}
              onClick={close}
            >
              <Icon className="size-4" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/8 hover:text-white" href="/">
          <ChevronLeft className="size-4" /> Marketplace
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({ children }: LayoutProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar pathname={pathname} />
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 shadow-2xl">
            <Sidebar close={() => setOpen(false)} pathname={pathname} />
            <Button className="absolute right-3 top-3 text-white hover:bg-white/10" onClick={() => setOpen(false)} size="icon" variant="ghost"><X /></Button>
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="glass-header sticky top-0 z-30 flex h-16 items-center border-b px-4 md:px-7">
          <Button className="mr-3 lg:hidden" onClick={() => setOpen(true)} size="icon" variant="ghost"><Menu /></Button>
          <div>
            <h1 className="text-lg font-black tracking-tight">{title(pathname)}</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">QuickMart platform control centre</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border bg-muted px-3 py-1.5 text-xs font-semibold md:flex">
              <Boxes className="size-3.5 text-emerald-600" /> Live environment
            </div>
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="p-4 md:p-7" id="main-content">{children}</main>
      </div>
    </div>
  );
}
