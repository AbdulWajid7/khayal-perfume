"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Review, type IReview } from "@/models/Review";
import { requireAuth } from "@/lib/auth";

export async function getReviews(status?: string): Promise<IReview[]> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const query =
    status === "pending" || status === "approved" || status === "rejected"
      ? ({ status } as const)
      : {};
  const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
  return (toJSON(reviews) || []) as IReview[];
}

export async function setReviewStatus(id: string, status: "approved" | "rejected") {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const review = await Review.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (review) revalidatePath(`/shop/${review.productHandle}`);
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const review = await Review.findByIdAndDelete(id).lean();
  if (review) revalidatePath(`/shop/${review.productHandle}`);
  revalidatePath("/admin/reviews");
}
