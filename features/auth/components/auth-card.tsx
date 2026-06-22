import { ShoppingBasket } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="mb-7 flex items-center justify-between">
        <Link className="flex items-center gap-2" href="/">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
            <ShoppingBasket className="size-5" />
          </span>
          <span className="text-xl font-black tracking-tight">
            QuickMart <span className="text-primary">SL</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="glass-panel rounded-3xl p-6 shadow-2xl shadow-primary/10 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
