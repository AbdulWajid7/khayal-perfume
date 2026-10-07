import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  AnalyticsRequestError,
  authenticateIntelligenceRequest,
  getIntelligenceAnalytics,
  parseAnalyticsDateRange,
} from "@/lib/intelligence-analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(`intelligence:${clientKey(req)}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { ...RESPONSE_HEADERS, "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  if (!authenticateIntelligenceRequest(req.headers.get("authorization"), process.env.KHAYAL_INTELLIGENCE_API_TOKEN)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { ...RESPONSE_HEADERS, "WWW-Authenticate": "Bearer" } }
    );
  }

  try {
    const range = parseAnalyticsDateRange(req.nextUrl.searchParams);
    const analytics = await getIntelligenceAnalytics(range);
    return NextResponse.json(analytics, { headers: RESPONSE_HEADERS });
  } catch (error) {
    if (error instanceof AnalyticsRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: RESPONSE_HEADERS });
    }
    console.error("Intelligence analytics request failed");
    return NextResponse.json({ error: "Analytics temporarily unavailable" }, { status: 503, headers: RESPONSE_HEADERS });
  }
}
