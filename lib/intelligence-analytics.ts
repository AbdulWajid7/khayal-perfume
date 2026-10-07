import { createHash, timingSafeEqual } from "node:crypto";
import { dbConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export const INTELLIGENCE_MIN_COHORT = 5;
export const INTELLIGENCE_MAX_DAYS = 365;
const DEFAULT_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class AnalyticsRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsRequestError";
  }
}

export type AnalyticsDateRange = {
  start: Date;
  endExclusive: Date;
  startDate: string;
  endDate: string;
};

function hashToken(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function authenticateIntelligenceRequest(authorization: string | null, expectedToken: string | undefined): boolean {
  if (!expectedToken || !authorization?.startsWith("Bearer ")) return false;
  const suppliedToken = authorization.slice(7);
  if (!suppliedToken) return false;
  return timingSafeEqual(hashToken(suppliedToken), hashToken(expectedToken));
}

function parseDate(value: string, field: string): Date {
  if (!DATE_PATTERN.test(value)) throw new AnalyticsRequestError(`${field} must use YYYY-MM-DD format`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AnalyticsRequestError(`${field} is not a valid date`);
  }
  return date;
}

export function parseAnalyticsDateRange(searchParams: URLSearchParams, now = new Date()): AnalyticsDateRange {
  const startValue = searchParams.get("start");
  const endValue = searchParams.get("end");
  if ((startValue && !endValue) || (!startValue && endValue)) {
    throw new AnalyticsRequestError("start and end must be provided together");
  }

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = endValue ? parseDate(endValue, "end") : today;
  const start = startValue ? parseDate(startValue, "start") : new Date(end.getTime() - (DEFAULT_DAYS - 1) * DAY_MS);
  if (start > end) throw new AnalyticsRequestError("start must not be after end");

  const days = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (days > INTELLIGENCE_MAX_DAYS) throw new AnalyticsRequestError(`date range cannot exceed ${INTELLIGENCE_MAX_DAYS} days`);

  return {
    start,
    endExclusive: new Date(end.getTime() + DAY_MS),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function suppressSmallCohorts<T extends { orderCount: number }>(rows: T[], minimum = INTELLIGENCE_MIN_COHORT): T[] {
  return rows.filter((row) => row.orderCount >= minimum);
}

const groupMetrics = {
  orderCount: { $sum: 1 },
  revenue: { $sum: "$total" },
  averageOrderValue: { $avg: "$total" },
};

function dimensionFacet(field: string) {
  return [
    { $group: { _id: { $ifNull: [field, "unknown"] }, ...groupMetrics } },
    { $project: { _id: 0, value: "$_id", orderCount: 1, revenue: 1, averageOrderValue: 1 } },
    { $sort: { revenue: -1 as const, value: 1 as const } },
  ];
}

function itemFacet(groupId: Record<string, unknown>) {
  return [
    { $unwind: "$items" },
    {
      $group: {
        _id: groupId,
        units: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.lineTotal" },
        orders: { $addToSet: "$_id" },
      },
    },
    { $project: { _id: 0, productId: "$_id.productId", product: "$_id.product", sku: "$_id.sku", variant: "$_id.variant", unitPrice: "$_id.unitPrice", units: 1, revenue: 1, orderCount: { $size: "$orders" } } },
    { $sort: { revenue: -1 as const } },
  ];
}

export async function getIntelligenceAnalytics(range: AnalyticsDateRange) {
  await dbConnect();
  const match = { createdAt: { $gte: range.start, $lt: range.endExclusive } };
  const [facets, catalog] = await Promise.all([
    Order.aggregate([
      { $match: match },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                ...groupMetrics,
                conversionProxyCount: {
                  $sum: { $cond: [{ $in: ["$paymentStatus", ["paid", "partially_refunded"]] }, 1, 0] },
                },
                units: { $sum: { $sum: "$items.quantity" } },
                discountedOrderCount: { $sum: { $cond: [{ $gt: ["$discount", 0] }, 1, 0] } },
                discountTotal: { $sum: "$discount" },
              },
            },
            { $project: { _id: 0 } },
          ],
          byOrderStatus: dimensionFacet("$orderStatus"),
          byPaymentStatus: dimensionFacet("$paymentStatus"),
          products: itemFacet({ productId: "$items.productId", product: "$items.name" }),
          skus: itemFacet({ productId: "$items.productId", product: "$items.name", sku: { $ifNull: ["$items.sku", "unknown"] }, variant: { $ifNull: ["$items.variantName", "unknown"] } }),
          pricePoints: itemFacet({ unitPrice: "$items.unitPrice" }),
          channels: dimensionFacet("$channel"),
          cities: dimensionFacet("$customer.address.city"),
          provinces: dimensionFacet("$customer.address.province"),
          utmSources: dimensionFacet("$attribution.utmSource"),
          utmMediums: dimensionFacet("$attribution.utmMedium"),
          utmCampaigns: dimensionFacet("$attribution.utmCampaign"),
          couponCodes: dimensionFacet("$discountCode"),
          couponTypes: dimensionFacet("$couponType"),
          daily: [
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, ...groupMetrics, units: { $sum: { $sum: "$items.quantity" } }, conversionProxyCount: { $sum: { $cond: [{ $in: ["$paymentStatus", ["paid", "partially_refunded"]] }, 1, 0] } } } },
            { $project: { _id: 0, date: "$_id", orderCount: 1, revenue: 1, averageOrderValue: 1, units: 1, conversionProxyCount: 1 } },
            { $sort: { date: 1 as const } },
          ],
        },
      },
    ]).option({ maxTimeMS: 15_000 }),
    Product.aggregate([
      { $group: { _id: "$status", productCount: { $sum: 1 }, totalStock: { $sum: "$stock" }, variantCount: { $sum: { $size: "$variants" } } } },
      { $project: { _id: 0, status: "$_id", productCount: 1, totalStock: 1, variantCount: 1 } },
      { $sort: { status: 1 } },
    ]).option({ maxTimeMS: 5_000 }),
  ]);

  const result = facets[0] || {};
  return {
    generatedAt: new Date().toISOString(),
    range: { start: range.startDate, end: range.endDate, timezone: "UTC" },
    minimumGeographyCohort: INTELLIGENCE_MIN_COHORT,
    overall: result.overall?.[0] || { orderCount: 0, revenue: 0, averageOrderValue: 0, conversionProxyCount: 0, units: 0, discountedOrderCount: 0, discountTotal: 0 },
    byOrderStatus: result.byOrderStatus || [],
    byPaymentStatus: result.byPaymentStatus || [],
    products: result.products || [],
    skus: result.skus || [],
    pricePoints: result.pricePoints || [],
    channels: result.channels || [],
    geography: {
      cities: suppressSmallCohorts(result.cities || []),
      provinces: suppressSmallCohorts(result.provinces || []),
    },
    attribution: { sources: result.utmSources || [], mediums: result.utmMediums || [], campaigns: result.utmCampaigns || [] },
    discounts: { couponCodes: result.couponCodes || [], couponTypes: result.couponTypes || [] },
    daily: result.daily || [],
    catalog: { byStatus: catalog },
  };
}
