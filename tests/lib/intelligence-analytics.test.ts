import { describe, expect, it } from "vitest";
import {
  AnalyticsRequestError,
  authenticateIntelligenceRequest,
  parseAnalyticsDateRange,
  suppressSmallCohorts,
} from "@/lib/intelligence-analytics";

describe("intelligence analytics authentication", () => {
  it("accepts only an exact Bearer token", () => {
    expect(authenticateIntelligenceRequest("Bearer correct-token", "correct-token")).toBe(true);
    expect(authenticateIntelligenceRequest("Bearer wrong-token", "correct-token")).toBe(false);
    expect(authenticateIntelligenceRequest("Basic correct-token", "correct-token")).toBe(false);
    expect(authenticateIntelligenceRequest(null, "correct-token")).toBe(false);
    expect(authenticateIntelligenceRequest("Bearer correct-token", undefined)).toBe(false);
  });
});

describe("intelligence analytics date ranges", () => {
  it("defaults to an inclusive 90-day UTC range", () => {
    const range = parseAnalyticsDateRange(new URLSearchParams(), new Date("2025-04-10T18:00:00Z"));
    expect(range.startDate).toBe("2025-01-11");
    expect(range.endDate).toBe("2025-04-10");
    expect(range.endExclusive.toISOString()).toBe("2025-04-11T00:00:00.000Z");
  });

  it("accepts a valid explicit bounded range", () => {
    const range = parseAnalyticsDateRange(new URLSearchParams("start=2024-01-01&end=2024-12-30"));
    expect(range.startDate).toBe("2024-01-01");
    expect(range.endDate).toBe("2024-12-30");
  });

  it.each([
    "start=2025-01-01",
    "start=2025-02-30&end=2025-03-01",
    "start=2025-03-02&end=2025-03-01",
    "start=2024-01-01&end=2024-12-31",
  ])("rejects an invalid or oversized range: %s", (query) => {
    expect(() => parseAnalyticsDateRange(new URLSearchParams(query))).toThrow(AnalyticsRequestError);
  });
});

describe("aggregate cohort suppression", () => {
  it("removes geography cohorts below the configured minimum", () => {
    const rows = [
      { value: "Small", orderCount: 4, revenue: 100 },
      { value: "Large", orderCount: 5, revenue: 500 },
    ];
    expect(suppressSmallCohorts(rows)).toEqual([{ value: "Large", orderCount: 5, revenue: 500 }]);
  });
});
