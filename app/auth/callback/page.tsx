"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function completeConfirmation() {
      const query = new URLSearchParams(window.location.search);
      const params = new URLSearchParams(window.location.hash.slice(1));
      const providerError = query.get("error_description") ?? params.get("error_description");
      if (providerError) {
        setError(providerError.replaceAll("+", " "));
        return;
      }

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const expiresIn = Number(params.get("expires_in") ?? 3600);
      if (!accessToken || !refreshToken) {
        setError("The email confirmation link is invalid or expired.");
        return;
      }

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken, expiresIn }),
      });
      if (!response.ok) {
        setError((await response.json()).error ?? "Unable to confirm your account.");
        return;
      }

      window.history.replaceState(null, "", window.location.pathname);
      router.replace(ROUTES.authRedirect);
      router.refresh();
    }
    void completeConfirmation();
  }, [router]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="glass-panel relative max-w-md rounded-3xl p-7 text-center shadow-2xl">
        <h1 className="text-2xl font-black">
          {error ? "Confirmation failed" : "Confirming your account"}
        </h1>
        <p className={`mt-3 text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
          {error || "Please wait while QuickMart secures your session…"}
        </p>
      </div>
    </main>
  );
}
