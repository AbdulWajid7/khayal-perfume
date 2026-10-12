/**
 * Old sample photos (a SILK ROYALE bottle whose label shows "Eau de Parfum" and another
 * brand's name). Never displayed: products without photography show their real signature
 * photo or a scent poster instead. Kept only so saved copies in the database are filtered.
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

/**
 * A product's own photos, with every sample photo removed. The sample bottle's label
 * shows "Eau de Parfum" and another brand's name, so it is never shown anywhere.
 */
export function realImagesFor(_handle: string, images: string[] = []): string[] {
  return images.filter(Boolean).filter((u) => !isSampleImage(u));
}
