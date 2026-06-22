"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function Dialog({ children, open, defaultOpen = false, onOpenChange }: { children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internal, setInternal] = React.useState(defaultOpen);
  const current = open ?? internal;
  const setOpen = (next: boolean) => { setInternal(next); onOpenChange?.(next); };
  return <DialogContext.Provider value={{ open: current, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children }: { children: React.ReactElement<{ onClick?: () => void }> }) {
  const context = React.useContext(DialogContext);
  return React.cloneElement(children, { onClick: () => context?.setOpen(true) });
}

export function DialogClose({ children }: { children: React.ReactElement<{ onClick?: () => void }> }) {
  const context = React.useContext(DialogContext);
  return React.cloneElement(children, { onClick: () => context?.setOpen(false) });
}

export function DialogContent({ className, children, showCloseButton = true, ...props }: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={() => context.setOpen(false)}>
      <div className={cn("relative w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl", className)} onMouseDown={(event) => event.stopPropagation()} {...props}>
        {children}
        {showCloseButton && <Button aria-label="Close" className="absolute right-3 top-3" onClick={() => context.setOpen(false)} size="icon" variant="ghost"><X /></Button>}
      </div>
    </div>
  );
}

export const DialogHeader = (props: React.ComponentProps<"div">) => <div className={cn("space-y-1.5", props.className)} {...props} />;
export const DialogFooter = (props: React.ComponentProps<"div">) => <div className={cn("mt-5 flex justify-end gap-2", props.className)} {...props} />;
export const DialogTitle = (props: React.ComponentProps<"h2">) => <h2 className={cn("text-lg font-semibold", props.className)} {...props} />;
export const DialogDescription = (props: React.ComponentProps<"p">) => <p className={cn("text-sm text-muted-foreground", props.className)} {...props} />;
