import { ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref = "/supermarkets",
  actionLabel = "Start shopping",
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed bg-muted/30 p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
          <ShoppingBasket className="size-7" />
        </div>
        <h2 className="mt-5 text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <Link className={buttonVariants({ className: "mt-5" })} href={actionHref}>{actionLabel}</Link>
      </div>
    </div>
  );
}
