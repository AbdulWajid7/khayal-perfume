import { unstable_cache } from "next/cache";

export interface GoogleReview {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface GoogleReviewsData {
  rating: number;
  totalCount: number;
  reviews: GoogleReview[];
  googleMapsUrl: string;
  writeReviewUrl: string;
}

async function fetchGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,googleMapsUri,reviews`,
      {
        headers: { "X-Goog-Api-Key": apiKey },
        next: { revalidate: 21600 },
      }
    );
    if (!res.ok) {
      console.error("Google Places API error:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const reviews: GoogleReview[] = (data.reviews || []).map(
      (r: {
        rating: number;
        text?: { text: string };
        relativePublishTimeDescription?: string;
        authorAttribution?: { displayName?: string; photoUri?: string };
      }) => ({
        authorName: r.authorAttribution?.displayName || "Google user",
        authorPhoto: r.authorAttribution?.photoUri,
        rating: r.rating,
        text: r.text?.text || "",
        relativeTime: r.relativePublishTimeDescription || "",
      })
    );
    return {
      rating: data.rating || 0,
      totalCount: data.userRatingCount || 0,
      reviews,
      googleMapsUrl: data.googleMapsUri || "",
      writeReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
    };
  } catch (error) {
    console.error("fetchGoogleReviews error:", error);
    return null;
  }
}

export const getGoogleReviews = unstable_cache(
  fetchGoogleReviews,
  ["google-place-reviews"],
  { revalidate: 21600 }
);
