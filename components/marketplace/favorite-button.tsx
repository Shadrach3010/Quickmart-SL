"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const favoriteKey = ["favorites"] as const;

export function FavoriteButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: favoriteKey,
    queryFn: async () => {
      const response = await fetch("/api/favorites", { cache: "no-store" });
      if (response.status === 401) return [] as string[];
      if (!response.ok) throw new Error("Unable to load favorites.");
      return (await response.json()).data as string[];
    },
    staleTime: 30_000,
  });
  const active = data.includes(productId);
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        active ? `/api/favorites/${encodeURIComponent(productId)}` : "/api/favorites",
        active
          ? { method: "DELETE" }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            },
      );
      if (response.status === 401) throw new Error("AUTH_REQUIRED");
      if (!response.ok) throw new Error("Unable to update your wishlist.");
    },
    onSuccess: () => {
      queryClient.setQueryData<string[]>(favoriteKey, (current = []) =>
        active ? current.filter((id) => id !== productId) : [...current, productId],
      );
      toast.success(active ? "Removed from wishlist." : "Saved to wishlist.");
    },
    onError: (error) => {
      if (error.message === "AUTH_REQUIRED") {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      } else {
        toast.error(error.message);
      }
    },
  });

  return (
    <Button
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn("rounded-full bg-white/90 shadow-sm hover:bg-white", active && "text-rose-600", className)}
      disabled={mutation.isPending}
      onClick={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      size="icon"
      variant="ghost"
    >
      <Heart className={cn(active && "fill-current")} />
    </Button>
  );
}
