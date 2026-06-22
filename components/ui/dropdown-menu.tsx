"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <details className="relative">{children}</details>;
export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode; asChild?: boolean }) => <summary className="list-none cursor-pointer">{children}</summary>;
export const DropdownMenuContent = ({ className, ...props }: React.ComponentProps<"div"> & { align?: string; sideOffset?: number }) => <div className={cn("absolute right-0 z-50 mt-2 min-w-40 rounded-xl border bg-popover p-1 shadow-xl", className)} {...props} />;
export const DropdownMenuItem = ({ className, inset, ...props }: React.ComponentProps<"button"> & { inset?: boolean }) => <button className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted", inset && "pl-8", className)} type="button" {...props} />;
export const DropdownMenuLabel = ({ className, inset, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) => <div className={cn("px-2 py-1.5 text-xs font-semibold", inset && "pl-8", className)} {...props} />;
export const DropdownMenuSeparator = (props: React.ComponentProps<"hr">) => <hr className={cn("my-1 border-border", props.className)} {...props} />;
export const DropdownMenuGroup = (props: React.ComponentProps<"div">) => <div {...props} />;
export const DropdownMenuShortcut = (props: React.ComponentProps<"span">) => <span className={cn("ml-auto text-xs text-muted-foreground", props.className)} {...props} />;
export const DropdownMenuCheckboxItem = DropdownMenuItem;
export const DropdownMenuRadioGroup = DropdownMenuGroup;
export const DropdownMenuRadioItem = DropdownMenuItem;
export const DropdownMenuSub = DropdownMenuGroup;
export const DropdownMenuSubTrigger = DropdownMenuItem;
export const DropdownMenuSubContent = DropdownMenuContent;
