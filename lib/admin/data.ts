import { requireSection } from "@/lib/admin/access";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Post, type IPost } from "@/models/Post";

export async function getPostsForAdmin() {
  const session = await requireSection("posts");
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const posts = await Post.find().sort({ createdAt: -1 }).lean();
  return toJSON(posts) as unknown as IPost[];
}

export async function getPostById(id: string) {
  const session = await requireSection("posts");
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const post = await Post.findById(id).lean();
  return toJSON(post) as unknown as IPost | null;
}
