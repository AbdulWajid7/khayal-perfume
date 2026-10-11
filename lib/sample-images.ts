/**
 * Temporary sample photos (all show the SILK ROYALE bottle). Products with no photos of
 * their own display these until real photography is ready. They are never sent to Google
 * (structured data, the Merchant feed) or used for link previews on other products.
 */
export const SAMPLE_IMAGES = [
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-46a4467d-2463-441f-a3b8-39421d962911.png",
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-e1b45b4e-4517-4049-9be5-8a487c05f642.png",
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-5787e7db-094f-4166-8232-52a7dd844f78.png",
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-46fa76a2-e92a-48d8-bb35-71866ef96eb8.png",
];

/** The product the sample photos actually show. */
export const SAMPLE_IMAGES_HANDLE = "silk-royale";

export function isSampleImage(url: string): boolean {
  return SAMPLE_IMAGES.includes(url);
}

/** A product's own photos, excluding sample photos that show a different fragrance. */
export function realImagesFor(handle: string, images: string[] = []): string[] {
  const clean = images.filter(Boolean);
  return handle === SAMPLE_IMAGES_HANDLE ? clean : clean.filter((u) => !isSampleImage(u));
}
