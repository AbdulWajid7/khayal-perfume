import { dbConnect } from "@/lib/mongoose";
import { ProductImage } from "@/models/ProductImage";

/** Serves a product photo stored in the database. Photos never change, so they cache forever. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clean = id.replace(/\.\w+$/, "");
  if (!/^[a-f0-9]{24}$/.test(clean)) return new Response("Not found", { status: 404 });
  await dbConnect();
  const img = await ProductImage.findById(clean).select("data contentType").lean();
  if (!img) return new Response("Not found", { status: 404 });
  const bytes = Buffer.isBuffer(img.data) ? img.data : Buffer.from((img.data as unknown as { buffer: ArrayBuffer }).buffer);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
