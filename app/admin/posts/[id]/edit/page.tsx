import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import { getPostById } from "@/lib/admin/data";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-parchment text-2xl font-medium">Edit Journal Post</h1>
      <PostForm post={post} />
    </div>
  );
}
