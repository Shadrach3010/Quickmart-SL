"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleHomeRoute } from "@/lib/auth/roles";
import { queryKeys } from "@/lib/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import type { UserProfile } from "@/types";

async function loadProfile(): Promise<UserProfile | null> {
  const response = await fetch("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to load session.");
  return (await response.json()).data;
}

export function UserMenu({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.session,
    queryFn: loadProfile,
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) {
    return <span className="size-9 animate-pulse rounded-full bg-muted" />;
  }
  if (!profile) {
    return alwaysShow ? (
      <Link className={buttonVariants({ size: "sm" })} href={ROUTES.signIn}>Sign in</Link>
    ) : null;
  }

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}` || "Q";
  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    queryClient.setQueryData(queryKeys.session, null);
    router.replace(ROUTES.home);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-black text-white">
          {initials.toUpperCase()}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>
          <p className="truncate text-sm">{profile.firstName} {profile.lastName}</p>
          <p className="truncate font-normal text-muted-foreground">{profile.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile.role === "customer" && (
          <Link className={buttonVariants({ className: "w-full justify-start", variant: "ghost" })} href={ROUTES.account}>
            <UserRound /> Profile
          </Link>
        )}
        <Link className={buttonVariants({ className: "w-full justify-start", variant: "ghost" })} href={getRoleHomeRoute(profile.role)}>
          <LayoutDashboard /> Dashboard
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={signOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
