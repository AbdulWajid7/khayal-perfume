import Link from "next/link";
import { getReviews, setReviewStatus, deleteReview } from "@/lib/admin/reviews";
import type { IReview } from "@/models/Review";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews | Khayal Admin",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold tracking-[0.1em]">
      {"★".repeat(rating)}
      <span className="text-stone-light/40">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: IReview }) {
  return (
    <div className="bg-pure border border-border rounded-xl p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Stars rating={review.rating} />
          <span className="text-ink text-sm font-medium">{review.name}</span>
          {review.verifiedPurchase && (
            <span className="text-[10px] uppercase tracking-[0.15em] text-gold border border-gold/40 rounded-full px-2 py-0.5">
              Verified
            </span>
          )}
        </div>
        <span
          className={`text-[10px] uppercase tracking-[0.15em] rounded-full px-2 py-0.5 ${
            review.status === "approved"
              ? "bg-green-50 text-green-700"
              : review.status === "rejected"
                ? "bg-red-50 text-red-700"
                : "bg-plum-pale text-plum"
          }`}
        >
          {review.status}
        </span>
      </div>
      <Link href={`/shop/${review.productHandle}`} className="text-gold text-sm hover:underline">
        {review.productTitle}
      </Link>
      <p className="text-stone text-sm leading-relaxed">{review.comment}</p>
      {review.orderNumber && (
        <p className="text-xs text-stone-light">Order: {review.orderNumber}</p>
      )}
      <div className="flex gap-3 pt-1">
        {review.status !== "approved" && (
          <form action={setReviewStatus.bind(null, review._id, "approved")}>
            <button className="text-xs bg-ink text-pure rounded-lg px-4 py-2 hover:bg-gold transition-colors">
              Approve
            </button>
          </form>
        )}
        {review.status !== "rejected" && (
          <form action={setReviewStatus.bind(null, review._id, "rejected")}>
            <button className="text-xs border border-border text-stone rounded-lg px-4 py-2 hover:border-plum hover:text-plum transition-colors">
              Reject
            </button>
          </form>
        )}
        <form action={deleteReview.bind(null, review._id)}>
          <button className="text-xs text-red-500 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status || "pending";
  const reviews = await getReviews(activeStatus === "all" ? undefined : activeStatus);

  const tabs = ["pending", "approved", "rejected", "all"];

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-ink text-3xl font-medium">Reviews</h1>

      <nav className="flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t}
            href={t === "all" ? "/admin/reviews?status=all" : `/admin/reviews?status=${t}`}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] border transition-colors ${
              activeStatus === t
                ? "bg-ink text-pure border-ink"
                : "text-stone border-border hover:border-gold hover:text-ink"
            }`}
          >
            {t}
          </Link>
        ))}
      </nav>

      {reviews.length === 0 ? (
        <p className="text-stone">No {activeStatus === "all" ? "" : activeStatus + " "}reviews yet.</p>
      ) : (
        <div className="grid gap-4 max-w-3xl">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
