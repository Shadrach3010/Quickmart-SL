"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthCard } from "@/features/auth/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import { forgotPasswordSchema } from "@/validations";

type Values = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function submit(values: Values) {
    setError("");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      setError("Unable to send a recovery email right now.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthCard
      description="We’ll email you a secure link to choose a new password."
      title="Reset your password"
    >
      {sent ? (
        <div className="text-center">
          <MailCheck className="mx-auto size-12 text-primary" />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            If an account exists for that email, a password reset link is on its way.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <label className="block text-sm font-semibold">
            Email address
            <Input className="mt-2 h-11" autoComplete="email" type="email" {...form.register("email")} />
            <span className="mt-1 block text-xs text-destructive">{form.formState.errors.email?.message}</span>
          </label>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button className="h-11 w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <Link className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-primary" href={ROUTES.signIn}>
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </AuthCard>
  );
}
