"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, MailCheck, RefreshCw } from "lucide-react";
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
import { signUpSchema } from "@/validations";

type InputValues = z.input<typeof signUpSchema>;
type Values = z.output<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: searchParams.get("ref")?.toUpperCase() ?? "",
    },
  });

  async function submit(values: Values) {
    setError("");
    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Unable to create your account.");
      return;
    }
    if (body.data.requiresEmailConfirmation) {
      setConfirmationEmail(body.data.email ?? values.email);
      return;
    }
    router.replace(ROUTES.authRedirect);
    router.refresh();
  }

  async function resend() {
    setError("");
    setResendMessage("");
    setResending(true);
    const response = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: confirmationEmail }),
    });
    const body = await response.json();
    setResending(false);
    if (!response.ok) {
      setError(body.error ?? "Unable to resend the confirmation email.");
      return;
    }
    setResendMessage(body.data.message);
  }

  if (confirmationEmail) {
    return (
      <AuthCard description="One quick verification keeps your account secure." title="Check your inbox">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10">
            <MailCheck className="size-8 text-primary" />
          </span>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            We sent a confirmation link to{" "}
            <strong className="break-all text-foreground">{confirmationEmail}</strong>. Open it to
            activate your account. Check spam or promotions if it is not in your inbox.
          </p>
          {resendMessage && (
            <p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-primary" role="status">
              <CheckCircle2 className="mr-1 inline size-4" /> {resendMessage}
            </p>
          )}
          {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
          <Button className="mt-5 w-full" disabled={resending} onClick={resend} variant="outline">
            <RefreshCw className={resending ? "animate-spin" : ""} />
            {resending ? "Sending…" : "Resend confirmation email"}
          </Button>
          <Link
            className="mt-5 inline-block font-semibold text-primary hover:underline"
            href={`${ROUTES.signIn}?email=${encodeURIComponent(confirmationEmail)}`}
          >
            Continue to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard description="Create your account and start shopping across Freetown." title="Join QuickMart">
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
        <input type="hidden" {...form.register("referralCode")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            First name
            <Input className="mt-2 h-11" autoComplete="given-name" {...form.register("firstName")} />
            <span className="mt-1 block text-xs text-destructive">{form.formState.errors.firstName?.message}</span>
          </label>
          <label className="text-sm font-semibold">
            Last name
            <Input className="mt-2 h-11" autoComplete="family-name" {...form.register("lastName")} />
            <span className="mt-1 block text-xs text-destructive">{form.formState.errors.lastName?.message}</span>
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Email address
          <Input className="mt-2 h-11" autoComplete="email" type="email" {...form.register("email")} />
          <span className="mt-1 block text-xs text-destructive">{form.formState.errors.email?.message}</span>
        </label>
        <label className="block text-sm font-semibold">
          Password
          <PasswordInput autoComplete="new-password" className="mt-2" {...form.register("password")} />
          <span className="mt-1 block text-xs text-destructive">{form.formState.errors.password?.message}</span>
        </label>
        <label className="block text-sm font-semibold">
          Confirm password
          <PasswordInput autoComplete="new-password" className="mt-2" {...form.register("confirmPassword")} />
          <span className="mt-1 block text-xs text-destructive">{form.formState.errors.confirmPassword?.message}</span>
        </label>
        {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
        <Button className="h-11 w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Creating account…" : "Create account"} <ArrowRight />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-semibold text-primary hover:underline" href={ROUTES.signIn}>Sign in</Link>
      </p>
    </AuthCard>
  );
}
