import "server-only";

import { getServerEnv } from "@/lib/env";

export interface SupabaseAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

export class SupabaseAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}

async function authRequest<T>(
  path: string,
  init: RequestInit,
  accessToken?: string,
): Promise<T> {
  const env = getServerEnv();
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...init.headers,
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new SupabaseAuthError(
      body.msg ?? body.message ?? body.error_description ?? "Authentication failed.",
      response.status,
      body.error_code ?? body.code,
    );
  }
  return body as T;
}

export function signInWithPassword(email: string, password: string) {
  return authRequest<SupabaseAuthSession>(
    "/auth/v1/token?grant_type=password",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
}

export function signUpWithPassword(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  redirectTo: string;
  referralCode?: string;
}) {
  return authRequest<Partial<SupabaseAuthSession> & { user: SupabaseAuthSession["user"] }>(
    `/auth/v1/signup?redirect_to=${encodeURIComponent(input.redirectTo)}`,
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          ...(input.referralCode && { referral_code: input.referralCode }),
        },
      }),
    },
  );
}

export function resendSignupConfirmation(email: string, redirectTo: string) {
  return authRequest<Record<string, never>>(
    `/auth/v1/resend?redirect_to=${encodeURIComponent(redirectTo)}`,
    {
      method: "POST",
      body: JSON.stringify({ type: "signup", email }),
    },
  );
}

export function refreshAuthSession(refreshToken: string) {
  return authRequest<SupabaseAuthSession>(
    "/auth/v1/token?grant_type=refresh_token",
    { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) },
  );
}

export function requestPasswordRecovery(email: string, redirectTo: string) {
  return authRequest<Record<string, never>>(
    `/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,
    { method: "POST", body: JSON.stringify({ email }) },
  );
}

export function updateAuthPassword(accessToken: string, password: string) {
  return authRequest<{ id: string }>(
    "/auth/v1/user",
    { method: "PUT", body: JSON.stringify({ password }) },
    accessToken,
  );
}

export function signOutAuthSession(accessToken: string) {
  return authRequest<Record<string, never>>(
    "/auth/v1/logout",
    { method: "POST", body: "{}" },
    accessToken,
  );
}
