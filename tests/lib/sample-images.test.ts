import { describe, expect, it } from "vitest";
import { SAMPLE_IMAGES, isSampleImage, realImagesFor } from "@/lib/sample-images";

describe("sample images", () => {
  it("recognises the sample photos", () => {
    expect(isSampleImage(SAMPLE_IMAGES[0])).toBe(true);
    expect(isSampleImage("https://example.com/own.jpg")).toBe(false);
  });

  it("keeps sample photos only on SILK ROYALE", () => {
    const mixed = ["https://example.com/own.jpg", SAMPLE_IMAGES[1]];
    expect(realImagesFor("silk-royale", mixed)).toEqual(mixed);
    expect(realImagesFor("dastaan", mixed)).toEqual(["https://example.com/own.jpg"]);
    expect(realImagesFor("dastaan", SAMPLE_IMAGES)).toEqual([]);
    expect(realImagesFor("dastaan", undefined)).toEqual([]);
  });
});
