"use client";

import { CheckCircle2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/formatters";
import type { Product, ProductReview } from "@/types";

function Stars({ value, label }: { value: number; label?: string }) {
  return <span aria-label={label ?? `${value} out of 5 stars`} className="inline-flex text-amber-500">{Array.from({ length: 5 }, (_, index) => <Star className={`size-4 ${index < Math.round(value) ? "fill-current" : "text-slate-300"}`} key={index} />)}</span>;
}

export function ProductReviews({ product, initialReviews }: { product: Product; initialReviews: ProductReview[] }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const average = initialReviews.length
    ? initialReviews.reduce((sum, review) => sum + review.rating, 0) / initialReviews.length
    : 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, rating, title, body }),
    });
    const responseBody = await response.json();
    setPending(false);
    if (response.status === 401) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/products/${product.slug}`)}`);
      return;
    }
    if (!response.ok) {
      toast.error(responseBody.error ?? "Unable to save your review.");
      return;
    }
    toast.success("Review saved.");
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <section aria-labelledby="reviews-title" className="mt-14">
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="h-fit rounded-3xl bg-[#143d2a] p-6 text-white">
          <p className="text-sm font-semibold text-white/60">Customer rating</p>
          <p className="mt-2 text-5xl font-black">{average.toFixed(1)}</p>
          <Stars label={`${average.toFixed(1)} average rating`} value={average} />
          <p className="mt-2 text-sm text-white/60">Based on {initialReviews.length} review{initialReviews.length === 1 ? "" : "s"}</p>
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-black" id="reviews-title">Product reviews</h2>
          <div className="mt-4 space-y-4">
            {initialReviews.length ? initialReviews.map((review) => (
              <article className="rounded-2xl border bg-card p-5" key={review.id}>
                <div className="flex flex-wrap items-center gap-2"><Stars value={review.rating} /><span className="font-bold">{review.title}</span></div>
                <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{review.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{review.author}</span>{review.verifiedPurchase && <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="size-3.5" /> Verified purchase</span>}<span>{formatDate(review.createdAt)}</span></div>
              </article>
            )) : <p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>}
          </div>
          <form className="mt-5 rounded-2xl border bg-muted/30 p-5" onSubmit={submit}>
            <h3 className="font-black">Review this product</h3>
            <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Rating">
              {Array.from({ length: 5 }, (_, index) => <button aria-checked={rating === index + 1} aria-label={`${index + 1} stars`} className="p-1 text-amber-500" key={index} onClick={() => setRating(index + 1)} role="radio" type="button"><Star className={`size-6 ${index < rating ? "fill-current" : ""}`} /></button>)}
            </div>
            <Input aria-label="Review title" className="mt-3 bg-card" onChange={(event) => setTitle(event.target.value)} placeholder="Review title" value={title} />
            <textarea aria-label="Review details" className="mt-3 min-h-24 w-full rounded-xl border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" onChange={(event) => setBody(event.target.value)} placeholder="What did you like? How was the quality?" value={body} />
            <Button className="mt-3" disabled={pending} type="submit">{pending ? "Saving…" : "Submit review"}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
