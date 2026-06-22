"use client";

import { Heart, MapPin, Menu, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store";
import { NotificationButton } from "@/components/marketplace/notification-button";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function MarketplaceHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useMounted();
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <>
      <header className="glass-header sticky top-0 z-40 border-b">
        <div className="marketplace-container flex h-16 items-center gap-3">
          <Button
            aria-label="Open menu"
            className="md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            size="icon"
            variant="ghost"
          >
            <Menu />
          </Button>
          <Link className="mr-auto flex items-center gap-2" href="/">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg text-white">
              Q
            </span>
            <span className="hidden text-lg font-black tracking-tight sm:inline">
              QuickMart <span className="text-primary">SL</span>
            </span>
          </Link>

          <button className="hidden items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm md:flex">
            <MapPin className="size-4 text-primary" />
            <span className="font-medium">Freetown</span>
            <span className="text-muted-foreground">· Deliver now</span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link className={buttonVariants({ variant: "ghost" })} href="/supermarkets">
              Supermarkets
            </Link>
            <Link className={buttonVariants({ variant: "ghost" })} href="/orders">
              Orders
            </Link>
          </nav>

          <Link
            aria-label={`Cart with ${mounted ? itemCount : 0} items`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" }),
              "relative rounded-full",
            )}
            href="/cart"
          >
            <ShoppingBag />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-black text-accent-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            aria-label="Wishlist"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden rounded-full sm:inline-flex")}
            href="/wishlist"
          >
            <Heart />
          </Link>
          <span className="hidden sm:inline-flex"><NotificationButton /></span>
          <span className="hidden sm:inline-flex"><ThemeToggle /></span>

          <UserMenu alwaysShow />
        </div>
      </header>
      {menuOpen && (
        <div className="glass-header fixed inset-x-0 top-16 z-30 border-b p-4 shadow-lg md:hidden">
          <div className="marketplace-container grid gap-2">
            <Link className={buttonVariants({ variant: "ghost", className: "justify-start" })} href="/supermarkets">
              <Search /> Browse supermarkets
            </Link>
            <Link className={buttonVariants({ variant: "ghost", className: "justify-start" })} href="/orders">
              <ShoppingBag /> My orders
            </Link>
            <Link className={buttonVariants({ variant: "ghost", className: "justify-start" })} href="/account">
              Profile & addresses
            </Link>
            <Link className={buttonVariants({ variant: "ghost", className: "justify-start" })} href="/wishlist">
              <Heart /> Wishlist
            </Link>
            <Link className={buttonVariants({ variant: "ghost", className: "justify-start" })} href="/notifications">
              Notifications
            </Link>
            <div className="flex items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold">
              Theme <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
