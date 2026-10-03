"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/reviews";
import { trackMarketing } from "@/lib/analytics";
import type { IReview } from "@/models/Review";

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${size} ${i <= rating ? "text-gold" : "text-stone-light/40"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.26 6.86.83-5.07 4.7 1.34 6.76L12 17.27 5.97 20.55l1.34-6.76-5.07-4.7 6.86-.83L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewSection({
  productHandle,
  reviews,
}: {
  productHandle: string;
  reviews: IReview[];
}) {
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [form, setForm] = useState({ name: "", comment: "", orderNumber: "" });
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("productHandle", productHandle);
    fd.set("name", form.name);
    fd.set("rating", String(rating));
    fd.set("comment", form.comment);
    fd.set("orderNumber", form.orderNumber);
    startTransition(async () => {
      const res = await submitReview(fd);
      setResult(res);
      if (res.ok) {
        setSubmitted(true);
        trackMarketing("review_submit", { product_handle: productHandle, rating });
      }
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-serif-display text-ink text-2xl font-medium">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(average)} />
            <span className="text-stone text-sm">
              {average.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-5 mb-10">
          {reviews.map((review) => (
            <article key={review._id} className="border border-border rounded-xl p-5 bg-pure">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Stars rating={review.rating} />
                  <span className="text-ink text-sm font-medium">{review.name}</span>
                </div>
                {review.verifiedPurchase && (
                  <span className="text-[10px] uppercase tracking-[0.15em] text-gold border border-gold/40 rounded-full px-2.5 py-1">
                    Verified Purchase
                  </span>
                )}
              </div>
              <p className="mt-3 text-stone text-sm leading-relaxed">{review.comment}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-stone text-sm mb-10">
          No reviews yet — be the first to share your experience with this fragrance.
        </p>
      )}

      {submitted ? (
        <p className="border border-gold/40 bg-plum-pale/40 rounded-xl p-4 text-sm text-ink">
          {result?.message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="border border-border rounded-xl p-5 bg-pure space-y-4">
          <h3 className="text-ink text-sm font-medium uppercase tracking-[0.15em]">Write a review</h3>

          <div className="flex items-center gap-2" role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                aria-label={`${i} star${i === 1 ? "" : "s"}`}
                className="p-1"
              >
                <svg
                  className={`h-6 w-6 transition-colors ${i <= rating ? "text-gold" : "text-stone-light/50 hover:text-gold/60"}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.9 6.26 6.86.83-5.07 4.7 1.34 6.76L12 17.27 5.97 20.55l1.34-6.76-5.07-4.7 6.86-.83L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            maxLength={80}
            className="input-admin w-full"
          />
          <textarea
            required
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            placeholder="How was the fragrance? Longevity, sillage, packaging…"
            rows={4}
            maxLength={2000}
            className="input-admin w-full"
          />
          <input
            value={form.orderNumber}
            onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
            placeholder="Order number (optional — marks your review as a verified purchase)"
            className="input-admin w-full"
          />

          {result && !result.ok && <p className="text-sm text-plum">{result.message}</p>}

          <button
            type="submit"
            disabled={pending || rating === 0}
            className="bg-gold text-pure rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {pending ? "Submitting…" : "Submit Review"}
          </button>
          <p className="text-xs text-stone">Reviews are published after a quick check by our team.</p>
        </form>
      )}
    </div>
  );
}
