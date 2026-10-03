import { getGoogleReviews } from "@/lib/google-reviews";

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${size} ${i <= Math.round(rating) ? "text-gold" : "text-stone-light/40"}`}
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.98 11.98 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.97 11.97 0 0 0 12 0 11.98 11.98 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export default async function GoogleReviews() {
  const data = await getGoogleReviews();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-serif-display text-ink text-2xl font-medium">Customer Reviews</h2>
        {data && data.totalCount > 0 && (
          <div className="flex items-center gap-2">
            <Stars rating={data.rating} />
            <span className="text-stone text-sm">
              {data.rating.toFixed(1)} · {data.totalCount} Google review
              {data.totalCount === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {data && data.reviews.length > 0 ? (
        <div className="space-y-5 mb-8">
          {data.reviews.map((review, i) => (
            <article key={i} className="border border-border rounded-xl p-5 bg-pure">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {review.authorPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.authorPhoto}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-dark text-ink text-xs font-medium">
                      {review.authorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Stars rating={review.rating} size="h-3.5 w-3.5" />
                    </div>
                    <p className="text-ink text-sm font-medium">
                      {review.authorName}
                      {review.relativeTime && (
                        <span className="text-stone-light font-normal"> · {review.relativeTime}</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-stone">
                  <GoogleIcon /> Google
                </span>
              </div>
              {review.text && (
                <p className="mt-3 text-stone text-sm leading-relaxed">{review.text}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-stone text-sm mb-8">
          We collect reviews on Google — real customers, verified by Google, never edited by us.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {data?.writeReviewUrl && (
          <a
            href={data.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gold px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-pure"
          >
            <GoogleIcon /> Write a review on Google
          </a>
        )}
        {data?.googleMapsUrl && (
          <a
            href={data.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone hover:text-gold transition-colors underline underline-offset-4"
          >
            See all reviews on Google
          </a>
        )}
      </div>
    </div>
  );
}
