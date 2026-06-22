"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthCard } from "@/features/auth/components/auth-card";
import { PasswordInput } from "@/features/auth/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import { signInSchema } from "@/validations";

type InputValues = z.input<typeof signInSchema>;
type Values = z.output<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: searchParams.get("email") ?? "", password: "" },
  });

  async function submit(values: Values) {
    setError("");
    setNeedsConfirmation(false);
    setResendMessage("");
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Unable to sign in.");
      setNeedsConfirmation(body.code === "email_not_confirmed");
      return;
    }
    const requested = searchParams.get("redirect_url");
    router.replace(
      requested?.startsWith("/") && !requested.startsWith("//")
        ? requested
        : ROUTES.authRedirect,
    );
    router.refresh();
  }

  async function resendConfirmation() {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", { message: "Enter your email address first." });
      return;
    }
    setResending(true);
    setResendMessage("");
    const response = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await response.json();
    setResending(false);
    if (!response.ok) {
      setError(body.error ?? "Unable to resend the confirmation email.");
      return;
    }
    setError("");
    setResendMessage(body.data.message);
  }

  return (
    <AuthCard description="Sign in to manage orders, saved groceries, and deliveries." title="Welcome back">
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
        <label className="block text-sm font-semibold">
          Email address
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <Input autoComplete="email" className="h-11 pl-9" placeholder="you@example.com" type="email" {...form.register("email")} />
          </div>
          <span className="mt-1 block text-xs text-destructive">{form.formState.errors.email?.message}</span>
        </label>
        <label className="block text-sm font-semibold">
          <span className="flex justify-between">
            Password
            <Link className="text-xs text-primary hover:underline" href={ROUTES.forgotPassword}>Forgot password?</Link>
          </span>
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-muted-foreground" />
            <PasswordInput autoComplete="current-password" className="pl-9" {...form.register("password")} />
          </div>
          <span className="mt-1 block text-xs text-destructive">{form.formState.errors.password?.message}</span>
        </label>
        {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
        {needsConfirmation && (
          <Button className="w-full" disabled={resending} onClick={resendConfirmation} variant="outline">
            <RefreshCw className={resending ? "animate-spin" : ""} />
            {resending ? "Sending…" : "Resend confirmation email"}
          </Button>
        )}
        {resendMessage && <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary" role="status">{resendMessage}</p>}
        <Button className="h-11 w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"} <ArrowRight />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to QuickMart?{" "}
        <Link className="font-semibold text-primary hover:underline" href={ROUTES.signUp}>Create an account</Link>
      </p>
    </AuthCard>
  );
}
