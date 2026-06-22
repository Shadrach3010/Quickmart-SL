"use client";

import {
  BarChart3,
  Boxes,
  ChevronLeft,
  LayoutDashboard,
  Menu,
  Package,
  ReceiptText,
  Settings,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LayoutProps, VendorSupermarket } from "@/types";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/inventory", label: "Inventory", icon: Boxes },
  { href: "/vendor/orders", label: "Orders", icon: ReceiptText },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

function pageTitle(pathname: string) {
  return navigation.find(
    ({ href }) => pathname === href || (href !== "/vendor" && pathname.startsWith(href)),
  )?.label ?? "Vendor dashboard";
}

function Sidebar({
  pathname,
  supermarket,
  onNavigate,
}: {
  pathname: string;
  supermarket: VendorSupermarket;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#10261b] text-white">
      <div className="border-b border-white/10 p-5">
        <Link className="flex items-center gap-3" href="/vendor" onClick={onNavigate}>
          <span className="grid size-10 place-items-center rounded-xl bg-[#42a972] font-black">
            Q
          </span>
          <div>
            <p className="font-black tracking-tight">QuickMart SL</p>
            <p className="text-[11px] text-white/50">Vendor centre</p>
          </div>
        </Link>
      </div>
      <div className="p-4">
        <div className="rounded-2xl bg-white/8 p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white text-lg font-black text-primary">
              {supermarket.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{supermarket.name}</p>
              <p className="flex items-center gap-1 text-[11px] capitalize text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {supermarket.status}
              </p>
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            (href !== "/vendor" && pathname.startsWith(href));
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white text-[#10261b]"
                  : "text-white/65 hover:bg-white/8 hover:text-white",
              )}
              href={href}
              key={href}
              onClick={onNavigate}
            >
              <Icon className="size-4" />
              {label}
              {label === "Orders" && (
                <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-black text-accent-foreground">
                  7
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/8 hover:text-white"
          href="/"
        >
          <ChevronLeft className="size-4" />
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}

export function VendorShell({
  children,
  supermarket,
}: LayoutProps & { supermarket: VendorSupermarket }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar pathname={pathname} supermarket={supermarket} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 shadow-2xl">
            <Sidebar
              onNavigate={() => setMobileOpen(false)}
              pathname={pathname}
              supermarket={supermarket}
            />
            <Button
              className="absolute right-3 top-3 text-white hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              size="icon"
              variant="ghost"
            >
              <X />
            </Button>
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="glass-header sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 md:px-7">
          <Button
            aria-label="Open navigation"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            size="icon"
            variant="ghost"
          >
            <Menu />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-tight">
              {pageTitle(pathname)}
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Manage {supermarket.name}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted sm:flex"
              href={`/supermarkets/${supermarket.slug}`}
            >
              <Store className="size-4" />
              View store
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="p-4 md:p-7" id="main-content">{children}</main>
      </div>
    </div>
  );
}
