import { ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        aria-label={`${alt} image unavailable`}
        className={cn("grid place-items-center bg-gradient-to-br from-secondary to-muted text-primary", className)}
        role="img"
      >
        <ShoppingBasket className="size-1/4" />
      </div>
    );
  }

  return (
    <div
      aria-label={alt}
      className={cn("bg-muted bg-contain bg-center bg-no-repeat", className)}
      role="img"
      style={{ backgroundImage: `url("${src.replaceAll('"', "%22")}")` }}
    />
  );
}
