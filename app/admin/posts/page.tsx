import Link from "next/link";
import { getPostsForAdmin } from "@/lib/admin/data";
import { importGuides } from "@/lib/admin/guides";
import { guides } from "@/lib/content/guides";
import { getAutopilot } from "@/lib/content-autopilot";
import { generateNow, updateAutopilot } from "@/lib/admin/autopilot";
import { geminiConfigured } from "@/lib/gemini";

// "Generate now" writes a full post with a cover image, which can take a couple of minutes.
export const maxDuration = 300;

const AUTOPILOT_MESSAGES: Record<string, string> = {
  published: "Done. The new post is live on the Journal.",
  draft: "Done. The new post was saved as a draft for you to review.",
  failed: "Generation failed. See the latest run below for the reason.",
};

export default async function PostsListPage({
  searchParams,
}: {
  searchParams: Promise<{ guides?: string; autopilot?: string }>;
}) {
  const [posts, autopilot] = await Promise.all([getPostsForAdmin(), getAutopilot()]);
  const { guides: importedGuides, autopilot: autopilotResult } = await searchParams;
  const aiOn = geminiConfigured();
  const pendingGuides = guides.filter((g) => !posts.some((p) => p.slug === g.slug));

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

      {importedGuides !== undefined && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {importedGuides} guide{importedGuides === "1" ? "" : "s"} added as draft. Open it, check the text and cover image, then set it to Published.
        </p>
      )}


      {autopilotResult && AUTOPILOT_MESSAGES[autopilotResult] && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {AUTOPILOT_MESSAGES[autopilotResult]}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-pure p-5 space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-ink">Journal autopilot</p>
          <p className="text-xs text-stone max-w-2xl">
            Every morning a trending blog post (10:00) and an in-depth SEO article (10:30) are researched, written and
            given a cover photo, then published. Posts that fail a quality check (too short, missing SEO fields, mentions
            of other brands) are kept as drafts. {aiOn ? "" : "Needs GEMINI_API_KEY and CRON_SECRET in Vercel to run."}
          </p>
        </div>
        <form action={updateAutopilot} className="flex flex-wrap items-center gap-6 text-sm text-ink">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="enabled" value="true" defaultChecked={autopilot.enabled} className="h-4 w-4" />
            Run daily
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="autoPublish" value="true" defaultChecked={autopilot.autoPublish} className="h-4 w-4" />
            Publish automatically (untick to review drafts first)
          </label>
          <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-cream">
            Save
          </button>
        </form>
        <div className="flex flex-wrap gap-3">
          {(["blog", "article"] as const).map((kind) => (
            <form key={kind} action={generateNow}>
              <input type="hidden" name="kind" value={kind} />
              <button
                type="submit"
                disabled={!aiOn}
                className="rounded-lg border border-gold px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-pure disabled:opacity-40"
              >
                Generate a {kind} now
              </button>
            </form>
          ))}
        </div>
        {autopilot.runs.length > 0 && (
          <ul className="divide-y divide-border text-xs">
            {autopilot.runs.slice(0, 6).map((run, i) => (
              <li key={i} className="py-2 flex flex-wrap gap-x-3 gap-y-1">
                <span className="text-stone">
                  {new Date(run.at).toLocaleString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                </span>
                <span className="uppercase tracking-wide text-stone">{run.kind}</span>
                <span
                  className={
                    run.status === "published" ? "text-green-700" : run.status === "draft" ? "text-amber-700" : "text-red-700"
                  }
                >
                  {run.status}
                </span>
                {run.postId ? (
                  <Link href={`/admin/posts/${run.postId}`} className="text-ink underline">
                    {run.title}
                  </Link>
                ) : null}
                {run.note && <span className="text-stone">{run.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {pendingGuides.length > 0 && (
        <form action={importGuides} className="flex flex-col gap-4 rounded-2xl border border-border bg-pure p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Ready-written guides ({pendingGuides.length})</p>
            <p className="mt-1 max-w-xl text-xs text-stone">{pendingGuides.map((g) => g.title).join(" · ")}</p>
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-gold px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-pure"
          >
            Import guides as drafts
          </button>
        </form>
      )}

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
