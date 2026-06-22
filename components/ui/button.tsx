import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  outline: "border border-border bg-background hover:bg-muted",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-muted hover:text-foreground",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-12 rounded-xl px-6 text-base",
  icon: "size-10",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      data-slot="button"
      type={type}
      {...props}
    />
  );
}
