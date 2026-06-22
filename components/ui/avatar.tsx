import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full border bg-muted",
        size === "sm" && "size-6",
        size === "lg" && "size-10",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage(props: React.ComponentProps<"img">) {
  // This primitive accepts arbitrary image sources; marketplace media uses
  // optimized route-specific components where dimensions are known.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={cn("size-full object-cover", props.className)} alt={props.alt ?? ""} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid size-full place-items-center text-xs font-semibold text-muted-foreground", className)} {...props} />;
}

export function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("absolute bottom-0 right-0 size-2.5 rounded-full bg-primary ring-2 ring-background", className)} {...props} />;
}

export function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex -space-x-2", className)} {...props} />;
}

export function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid size-8 place-items-center rounded-full bg-muted text-xs ring-2 ring-background", className)} {...props} />;
}
