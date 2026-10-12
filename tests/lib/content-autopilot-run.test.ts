import { beforeEach, describe, expect, it, vi } from "vitest";

const created: Record<string, unknown>[] = [];
const runs: Record<string, unknown>[] = [];
let settings = { enabled: true, autoPublish: true, runs: [] as Record<string, unknown>[] };
let topicReply: string | null = null;
let postReply: string | null = null;
let postReplies: (string | null)[] = [];
const models: (string | undefined)[] = [];
let imageReply: { mimeType: string; data: Buffer } | null = null;
const prompts: string[] = [];

const chain = (value: unknown) => ({ sort: () => chain(value), limit: () => chain(value), select: () => chain(value), lean: async () => value });

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@vercel/blob", () => ({ put: vi.fn(async (name: string) => ({ url: `https://x.public.blob.vercel-storage.com/${name}` })) }));
vi.mock("@/lib/mongoose", () => ({ dbConnect: vi.fn(), toJSON: (d: unknown) => d }));
vi.mock("@/models/User", () => ({ User: { findOne: () => chain({ _id: "admin1" }) } }));
vi.mock("@/models/Post", () => ({
  Post: {
    find: () => chain([{ title: "Old post", focusKeyword: "how to make perfume last longer" }]),
    exists: vi.fn(async () => null),
    create: vi.fn(async (doc: Record<string, unknown>) => (created.push(doc), { _id: "post1" })),
  },
}));
vi.mock("@/models/ContentAutopilot", () => ({
  ContentAutopilot: {
    findOne: () => ({ lean: async () => settings }),
    create: vi.fn(),
    updateOne: vi.fn(async (_q: unknown, u: { $push?: { runs: { $each: Record<string, unknown>[] } } }) => {
      if (u.$push) runs.push(...u.$push.runs.$each);
    }),
  },
}));
vi.mock("@/lib/bot-assistant", () => ({
  loadKnowledgeProducts: vi.fn(async () => [{ handle: "silk-royale", orderable: true }]),
  buildStoreKnowledge: vi.fn(async () => "KNOWLEDGE"),
}));
vi.mock("@/lib/gemini", async (orig) => ({
  ...(await orig<typeof import("@/lib/gemini")>()),
  geminiConfigured: () => true,
  geminiGenerate: vi.fn(async (o: { googleSearch?: boolean; model?: string; turns: { text: string }[] }) => {
    prompts.push(o.turns[0].text);
    if (o.googleSearch) return topicReply;
    models.push(o.model);
    return postReplies.length ? postReplies.shift()! : postReply;
  }),
  geminiImage: vi.fn(async () => imageReply),
}));

import { runAutopilot } from "@/lib/content-autopilot";

const body = Array.from({ length: 4 }, (_, i) => `<h2>Part ${i}</h2><p>${"useful words here ".repeat(80)}</p>`).join("");
const goodPost = {
  title: "Wedding season scents for Karachi evenings",
  metaTitle: "Wedding perfume for Karachi evenings",
  metaDescription: "How to pick a wedding perfume that lasts through a long Karachi evening, from mehndi to walima.",
  focusKeyword: "wedding perfume Pakistan",
  excerpt: "Pick a scent that lasts from mehndi to walima.",
  tags: ["Weddings"],
  contentHtml: `<p>Try <a href="/shop/silk-royale">SILK ROYALE</a>.</p>${body}`,
  imagePrompt: "marigold petals and silk",
  imageAlt: "Marigold petals on silk",
};

describe("runAutopilot", () => {
  beforeEach(() => {
    created.length = 0;
    runs.length = 0;
    prompts.length = 0;
    models.length = 0;
    postReplies = [];
    settings = { enabled: true, autoPublish: true, runs: [] };
    topicReply = JSON.stringify({ topic: "Winter wedding scents", focusKeyword: "wedding perfume Pakistan" });
    postReply = JSON.stringify(goodPost);
    imageReply = null;
    process.env.BLOB_READ_WRITE_TOKEN = "token";
  });

  it("publishes a good post with an AI cover and tells the topic search what is already covered", async () => {
    imageReply = { mimeType: "image/jpeg", data: Buffer.from("img") };
    const r = await runAutopilot("blog");
    expect(r.status).toBe("published");
    expect(created[0]).toMatchObject({ status: "published", schemaType: "BlogPosting", slug: "wedding-perfume-pakistan" });
    expect((created[0].coverImage as { url: string }).url).toContain("blob.vercel-storage.com/journal/");
    expect((created[0].tags as string[])[0]).toBe("Trends");
    expect(prompts[0]).toContain("how to make perfume last longer");
  });

  it("uses a site image when image generation is unavailable", async () => {
    const r = await runAutopilot("article");
    expect(r.note).toContain("site image");
    expect(created[0]).toMatchObject({ schemaType: "Article" });
    expect((created[0].coverImage as { url: string }).url.startsWith("/images/")).toBe(true);
  });

  it("keeps a weak post as a draft", async () => {
    postReply = JSON.stringify({ ...goodPost, contentHtml: "<h2>Short</h2><p>Too short.</p>" });
    const r = await runAutopilot("blog");
    expect(r.status).toBe("draft");
    expect(r.note).toContain("kept as draft");
  });

  it("saves drafts only when auto-publish is off", async () => {
    settings.autoPublish = false;
    const r = await runAutopilot("blog");
    expect(r.status).toBe("draft");
  });

  it("falls back to an evergreen topic it has not covered yet", async () => {
    topicReply = null;
    await runAutopilot("article");
    expect(prompts[1]).toContain("Focus keyword: extrait de parfum vs eau de parfum");
  });

  it("retries with the fallback model when the main model fails", async () => {
    postReplies = [null, JSON.stringify(goodPost)];
    const r = await runAutopilot("blog");
    expect(r.status).toBe("published");
    expect(models).toEqual(["gemini-flash-latest", "gemini-2.5-flash"]);
  });

  it("explains the failure when both models fail", async () => {
    postReply = "not json";
    const r = await runAutopilot("blog");
    expect(r.status).toBe("failed");
    expect(r.note).toContain("gemini-flash-latest: reply was not valid JSON");
    expect(r.note).toContain("gemini-2.5-flash");
  });

  it("does not run twice in one day", async () => {
    settings.runs = [{ kind: "blog", status: "published", at: new Date().toISOString() }];
    const r = await runAutopilot("blog");
    expect(r.note).toBe("Already ran today");
    expect(created).toHaveLength(0);
  });
});
