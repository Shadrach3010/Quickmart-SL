"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthCard } from "@/features/auth/components/auth-card";
import { PasswordInput } from "@/features/auth/components/password-input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { resetPasswordSchema } from "@/validations";

type InputValues = z.input<typeof resetPasswordSchema>;
type Values = z.output<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = Number(params.get("expires_in") ?? 3600);
    if (!accessToken || !refreshToken) {
      fetch("/api/auth/me").then((response) => {
        if (response.ok) setReady(true);
        else setError("This recovery link is invalid or has expired.");
      });
      return;
    }
    fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken, expiresIn }),
    }).then(async (response) => {
      if (response.ok) {
        window.history.replaceState(null, "", window.location.pathname);
        setReady(true);
      } else {
        setError((await response.json()).error);
      }
    });
  }, []);

  async function submit(values: Values) {
    setError("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Unable to update your password.");
      return;
    }
    setComplete(true);
  }

  return (
    <AuthCard description="Choose a secure password for your QuickMart account." title="Create a new password">
      {complete ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Your password has been updated successfully.</p>
          <Link className="mt-5 inline-block font-semibold text-primary" href={ROUTES.dashboard}>Continue to your account</Link>
        </div>
      ) : ready ? (
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <label className="block text-sm font-semibold">
            New password
            <PasswordInput className="mt-2" autoComplete="new-password" {...form.register("password")} />
            <span className="mt-1 block text-xs text-destructive">{form.formState.errors.password?.message}</span>
          </label>
          <label className="block text-sm font-semibold">
            Confirm password
            <PasswordInput className="mt-2" autoComplete="new-password" {...form.register("confirmPassword")} />
            <span className="mt-1 block text-xs text-destructive">{form.formState.errors.confirmPassword?.message}</span>
          </label>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button className="h-11 w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      ) : error ? (
        <div className="text-center text-sm text-destructive">{error}</div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Verifying your recovery link…</p>
      )}
    </AuthCard>
  );
}
