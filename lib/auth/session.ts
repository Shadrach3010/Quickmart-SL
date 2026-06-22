import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/lib/env";
import { SupabaseClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants/routes";
import { AUTH_COOKIES } from "@/lib/constants/auth";
import type { AppRole, UserProfile } from "@/types";

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface ProfileRow {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: { name: AppRole } | Array<{ name: AppRole }>;
}

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIES.access)?.value ?? null;
}

export async function getCurrentAuthUser(): Promise<SupabaseAuthUser | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const env = getServerEnv();
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json() as Promise<SupabaseAuthUser>;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const [user, accessToken] = await Promise.all([
    getCurrentAuthUser(),
    getAccessToken(),
  ]);
  if (!user || !accessToken) return null;

  const env = getServerEnv();
  const client = new SupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const rows = await client.request<ProfileRow[]>(
    `/rest/v1/profiles?auth_user_id=eq.${encodeURIComponent(user.id)}&select=id,auth_user_id,email,first_name,last_name,phone,avatar_url,is_active,created_at,updated_at,roles(name)&limit=1`,
    { accessToken },
  );
  const row = rows[0];
  if (!row?.is_active) return null;

  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    role: first(row.roles).name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function requireUser() {
  const user = await getCurrentAuthUser();
  if (!user) redirect(ROUTES.signIn);
  return user;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect(ROUTES.signIn);
  return profile;
}
