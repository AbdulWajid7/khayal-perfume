import Link from "next/link";
import { getPostsForAdmin } from "@/lib/admin";

export default async function PostsListPage() {
  const posts = await getPostsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-parchment text-2xl font-medium">Journal Posts</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 rounded bg-oud-gold text-midnight text-sm font-medium hover:opacity-90"
        >
          + New Post
        </Link>
      </div>

      <div className="border border-border-subtle rounded-xl overflow-hidden bg-charcoal">
        <table className="w-full text-left text-sm">
          <thead className="bg-midnight text-warm-taupe">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-t border-border-subtle">
                <td className="px-4 py-3 text-parchment">{post.title}</td>
                <td className="px-4 py-3 text-warm-taupe">{post.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      post.status === "published"
                        ? "bg-green-900/40 text-green-100"
                        : "bg-amber-900/40 text-amber-100"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-warm-taupe">
                  {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts/${post._id}/edit`}
                    className="text-oud-gold hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-warm-taupe">
                  No posts yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
