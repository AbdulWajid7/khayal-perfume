"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TiptapEditor from "./TiptapEditor";
import { createPost, updatePost, uploadCoverImage } from "@/lib/admin";
import type { IPost } from "@/models/Post";

interface PostFormProps {
  post?: IPost | null;
}

export default function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState(post?.coverImage?.url || "");
  const [content, setContent] = useState(post?.content || "");
  const isEdit = Boolean(post);

  async function handleSubmit(formData: FormData) {
    formData.set("content", content);
    setMessage("");
    startTransition(async () => {
      try {
        const result = isEdit && post
          ? await updatePost(post._id, formData)
          : await createPost(formData);
        setMessage(isEdit ? "Post updated." : "Post created.");
        if (!isEdit) {
          router.push(`/admin/posts/${result._id}/edit`);
        }
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const { url } = await uploadCoverImage(form);
      setCoverUrl(url);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Image upload failed.");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-4xl">
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.startsWith("Post") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            defaultValue={post?.title}
            required
            className="w-full px-3 py-2 rounded bg-pure border border-border text-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={post?.slug}
            required
            className="w-full px-3 py-2 rounded bg-pure border border-border text-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <div>
        <label className="block text-ink text-sm font-medium mb-1">Excerpt</label>
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={post?.excerpt}
          required
          className="w-full px-3 py-2 rounded bg-pure border border-border text-ink focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label className="block text-ink text-sm font-medium mb-1">Content</label>
        <TiptapEditor value={content} onChange={setContent} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            defaultValue={post?.status || "draft"}
            className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Publish Date</label>
          <input
            name="publishedAt"
            type="datetime-local"
            defaultValue={post ? new Date(post.publishedAt).toISOString().slice(0, 16) : ""}
            required
            className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
          />
        </div>
      </div>

      <div>
        <label className="block text-ink text-sm font-medium mb-1">Tags (comma separated)</label>
        <input
          name="tags"
          defaultValue={post?.tags?.join(", ")}
          placeholder="Oud, Gifting, Scent Guides"
          className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Cover Image URL</label>
          <input
            name="coverImageUrl"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
          />
          <input name="coverImageAlt" defaultValue={post?.coverImage?.alt} placeholder="Alt text" className="mt-2 w-full px-3 py-2 rounded bg-pure border border-border text-ink" />
        </div>
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Or upload cover</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="block w-full text-sm text-ink file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gold file:text-pure hover:file:opacity-90"
          />
          {coverUrl && <Image src={coverUrl} alt="cover preview" width={160} height={96} className="mt-2 h-24 w-auto object-cover rounded border border-border" />}
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-ink font-medium">SEO Settings</h3>
        <div>
          <label className="block text-ink text-sm font-medium mb-1">SEO Title</label>
          <input
            name="metaTitle"
            defaultValue={post?.metaTitle}
            placeholder="Leave blank to use the post title"
            className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
          />
        </div>
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Meta Description</label>
          <textarea
            name="metaDescription"
            rows={2}
            defaultValue={post?.metaDescription}
            className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-ink text-sm font-medium mb-1">Focus Keyword</label>
            <input
              name="focusKeyword"
              defaultValue={post?.focusKeyword}
              className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
            />
          </div>
          <div>
            <label className="block text-ink text-sm font-medium mb-1">Canonical URL</label>
            <input
              name="canonicalUrl"
              defaultValue={post?.canonicalUrl}
              placeholder="https://www.khayalparfum.com/journal/..."
              className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
            />
          </div>
          <div>
            <label className="block text-ink text-sm font-medium mb-1">OG Image</label>
            <input
              name="ogImage"
              defaultValue={post?.ogImage}
              className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-ink text-sm font-medium mb-1">Schema Type</label>
            <select
              name="schemaType"
              defaultValue={post?.schemaType || "BlogPosting"}
              className="w-full px-3 py-2 rounded bg-pure border border-border text-ink"
            >
              <option value="BlogPosting">BlogPosting</option>
              <option value="Article">Article</option>
              <option value="NewsArticle">NewsArticle</option>
            </select>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 text-ink text-sm">
              <input
                name="noIndex"
                type="checkbox"
                defaultChecked={post?.noIndex}
                className="w-4 h-4"
              />
              No Index
            </label>
            <label className="flex items-center gap-2 text-ink text-sm">
              <input
                name="noFollow"
                type="checkbox"
                defaultChecked={post?.noFollow}
                className="w-4 h-4"
              />
              No Follow
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2 rounded bg-gold text-pure font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
      </button>
    </form>
  );
}
