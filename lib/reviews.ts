"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Review, type IReview } from "@/models/Review";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { checkRateLimit } from "@/lib/rate-limit";

export async function getApprovedReviews(productId: string): Promise<IReview[]> {
  try {
    await dbConnect();
    const reviews = await Review.find({ productId, status: "approved" })
      .sort({ createdAt: -1 })
      .lean();
    return (toJSON(reviews) || []) as IReview[];
  } catch (error) {
    console.error("getApprovedReviews error:", error);
    return [];
  }
}

export async function submitReview(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(`review:${ip}`, 3, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, message: `Too many reviews. Try again in ${limit.retryAfterSeconds / 60 | 0} minutes.` };
  }

  const productHandle = formData.get("productHandle")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment")?.toString().trim();
  const orderNumber = formData.get("orderNumber")?.toString().trim() || undefined;

  if (!productHandle || !name || !comment || !rating || rating < 1 || rating > 5) {
    return { ok: false, message: "Please fill in all required fields." };
  }

  try {
    await dbConnect();

    const product = await Product.findOne({ handle: productHandle, status: "active" }).lean();
    if (!product) return { ok: false, message: "Product not found." };

    let verifiedPurchase = false;
    if (orderNumber) {
      const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() }).lean();
      if (order) {
        const productId = (product as { _id: { toString(): string } })._id.toString();
        verifiedPurchase = (order.items || []).some(
          (item: { productId?: string; name?: string }) =>
            item.productId === productId || item.name === product.title
        );
      }
    }

    await Review.create({
      productId: (product as { _id: { toString(): string } })._id.toString(),
      productHandle,
      productTitle: product.title,
      name: name.slice(0, 80),
      rating,
      comment: comment.slice(0, 2000),
      orderNumber,
      verifiedPurchase,
      status: "pending",
    });

    revalidatePath(`/shop/${productHandle}`);
    return {
      ok: true,
      message: "Thank you! Your review has been submitted and will appear after approval.",
    };
  } catch (error) {
    console.error("submitReview error:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
