"use client";

import type { LayoutProps } from "@/types";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: LayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
      <QueryProvider>{children}</QueryProvider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
