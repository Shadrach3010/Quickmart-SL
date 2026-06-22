"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function Sheet({ children, open, defaultOpen = false, onOpenChange }: { children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internal, setInternal] = React.useState(defaultOpen);
  const current = open ?? internal;
  const setOpen = (next: boolean) => { setInternal(next); onOpenChange?.(next); };
  return <SheetContext.Provider value={{ open: current, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: { children: React.ReactElement<{ onClick?: () => void }> }) {
  const context = React.useContext(SheetContext);
  return React.cloneElement(children, { onClick: () => context?.setOpen(true) });
}

export function SheetClose({ children }: { children: React.ReactElement<{ onClick?: () => void }> }) {
  const context = React.useContext(SheetContext);
  return React.cloneElement(children, { onClick: () => context?.setOpen(false) });
}

export function SheetContent({ className, children, side = "right", showCloseButton = true }: { className?: string; children: React.ReactNode; side?: "top" | "right" | "bottom" | "left"; showCloseButton?: boolean }) {
  const context = React.useContext(SheetContext);
  if (!context?.open) return null;
  const positions = { right: "inset-y-0 right-0 w-4/5 max-w-sm", left: "inset-y-0 left-0 w-4/5 max-w-sm", top: "inset-x-0 top-0", bottom: "inset-x-0 bottom-0" };
  return <div className="fixed inset-0 z-50 bg-black/40" onMouseDown={() => context.setOpen(false)}><div className={cn("fixed bg-background p-5 shadow-2xl", positions[side], className)} onMouseDown={(event) => event.stopPropagation()}>{children}{showCloseButton && <Button className="absolute right-3 top-3" onClick={() => context.setOpen(false)} size="icon" variant="ghost"><X /></Button>}</div></div>;
}

export const SheetHeader = (props: React.ComponentProps<"div">) => <div className={cn("space-y-1", props.className)} {...props} />;
export const SheetFooter = (props: React.ComponentProps<"div">) => <div className={cn("mt-auto", props.className)} {...props} />;
export const SheetTitle = (props: React.ComponentProps<"h2">) => <h2 className={cn("text-lg font-semibold", props.className)} {...props} />;
export const SheetDescription = (props: React.ComponentProps<"p">) => <p className={cn("text-sm text-muted-foreground", props.className)} {...props} />;
