import Link from "next/link";
import { getPostsForAdmin } from "@/lib/admin/data";

export default async function PostsListPage() {
  const posts = await getPostsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-ink text-3xl font-medium">Journal Posts</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center bg-gold text-pure rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
        >
          + New Post
        </Link>
      </div>

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
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
              <tr key={post._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink font-medium">{post.title}</td>
                <td className="px-4 py-3 text-stone">{post.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone">
                  {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts/${post._id}/edit`}
                    className="text-gold text-xs hover:text-gold-light"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone">
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
