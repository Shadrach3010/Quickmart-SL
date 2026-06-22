import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  description,
  href,
}: {
  title: string;
  description?: string;
  href?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <Link className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary" href={href}>
          View all <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
