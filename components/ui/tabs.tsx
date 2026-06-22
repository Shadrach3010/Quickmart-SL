"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ value: string; setValue: (value: string) => void } | null>(null);

export function Tabs({
  value,
  defaultValue = "",
  onValueChange,
  className,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value ?? internal;
  const setValue = (next: string) => {
    setInternal(next);
    onValueChange?.(next);
  };
  return <TabsContext.Provider value={{ value: current, setValue }}><div className={cn("flex flex-col gap-2", className)}>{children}</div></TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.ComponentProps<"div"> & { variant?: "default" | "line" }) {
  return <div className={cn("inline-flex w-fit rounded-lg bg-muted p-1", className)} role="tablist" {...props} />;
}

export function TabsTrigger({ value, className, ...props }: React.ComponentProps<"button"> & { value: string }) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;
  return <button aria-selected={active} className={cn("rounded-md px-3 py-1.5 text-sm font-medium", active ? "bg-background shadow-sm" : "text-muted-foreground", className)} onClick={() => context?.setValue(value)} role="tab" type="button" {...props} />;
}

export function TabsContent({ value, className, ...props }: React.ComponentProps<"div"> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return <div className={cn("outline-none", className)} role="tabpanel" {...props} />;
}

export function tabsListVariants() {
  return "inline-flex w-fit rounded-lg bg-muted p-1";
}
