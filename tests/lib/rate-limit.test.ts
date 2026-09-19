import { describe, it, expect } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("rate limit", () => {
  it("allows requests up to the limit", () => {
    resetRateLimit("test-key");
    expect(checkRateLimit("test-key", 3, 60000).allowed).toBe(true);
    expect(checkRateLimit("test-key", 3, 60000).allowed).toBe(true);
    expect(checkRateLimit("test-key", 3, 60000).allowed).toBe(true);
  });

  it("blocks requests beyond the limit", () => {
    resetRateLimit("test-key");
    checkRateLimit("test-key", 2, 60000);
    checkRateLimit("test-key", 2, 60000);
    const result = checkRateLimit("test-key", 2, 60000);
    expect(result.allowed).toBe(false);
    if (result.allowed) throw new Error("Expected request to be rate limited");
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("isolates keys", () => {
    resetRateLimit("key-a");
    resetRateLimit("key-b");
    checkRateLimit("key-a", 1, 60000);
    expect(checkRateLimit("key-b", 1, 60000).allowed).toBe(true);
  });
});
