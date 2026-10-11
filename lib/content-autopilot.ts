import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { ContentAutopilot, type AutopilotKind, type IAutopilotRun, type IContentAutopilot } from "@/models/ContentAutopilot";
import { buildStoreKnowledge, loadKnowledgeProducts } from "@/lib/bot-assistant";
import { geminiConfigured, geminiGenerate, geminiImage, parseJsonReply } from "@/lib/gemini";
import {
  checkQuality,
  clamp,
  EVERGREEN_TOPICS,
  fallbackImage,
  PHOTO_STYLE,
  sanitizePostHtml,
  slugify,
  type GeneratedPost,
} from "@/lib/content-autopilot-helpers";

const SPEC: Record<AutopilotKind, { label: string; schemaType: "BlogPosting" | "Article"; words: string; minWords: number; tag: string }> = {
  blog: { label: "blog post", schemaType: "BlogPosting", words: "700-1000", minWords: 550, tag: "Trends" },
  article: { label: "in-depth article", schemaType: "Article", words: "1200-1600", minWords: 950, tag: "Guides" },
};

export async function getAutopilot(): Promise<IContentAutopilot> {
  await dbConnect();
  const doc =
    (await ContentAutopilot.findOne().lean()) ||
    (await ContentAutopilot.create({ enabled: true, autoPublish: true, runs: [] })).toObject();
  return toJSON(doc as never) as unknown as IContentAutopilot;
}

async function recordRun(run: IAutopilotRun) {
  await ContentAutopilot.updateOne({}, { $push: { runs: { $each: [run], $position: 0, $slice: 20 } } }, { upsert: true });
}

interface Topic {
  topic: string;
  focusKeyword: string;
  angle?: string;
  whyNow?: string;
}

/** Step 1: find one timely topic with Google Search, avoiding anything already covered. */
async function findTopic(kind: AutopilotKind, covered: string[]): Promise<Topic> {
  const today = new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "long", year: "numeric" });
  const brief =
    kind === "blog"
      ? "a TRENDING, timely topic: something people in Pakistan are searching or talking about this week or season that connects to fragrance (weddings, weather, festivals, Eid, Ramadan, cricket, fashion weeks, celebrity-free style trends, gifting dates, back to office or university)."
      : "an EVERGREEN, high-search-intent topic: a question Pakistani shoppers search on Google about perfume (choosing, longevity, notes, concentration, storage, gifting, budget), with a clear focus keyword a small brand can rank for.";
  const raw = await geminiGenerate({
    googleSearch: true,
    timeoutMs: 20000,
    maxOutputTokens: 2048,
    system:
      "You are the SEO and content strategist for KHAYAL, a Karachi fragrance brand selling extraits de parfum online across Pakistan. " +
      "Never pick topics about other perfume brands, designer fragrances, celebrities, politics, religion debates, or medical claims.",
    turns: [
      {
        role: "user",
        text:
          `Today is ${today}. Use Google Search to find ${brief}\n\n` +
          `Already covered (do not repeat or closely overlap): ${covered.slice(0, 60).join(" | ") || "nothing yet"}\n\n` +
          'Reply with ONLY a JSON object: {"topic": "...", "focusKeyword": "...", "angle": "one sentence on the angle", "whyNow": "one sentence on why it is timely or searched"}',
      },
    ],
  });
  const found = parseJsonReply<Topic>(raw);
  if (found?.topic && found.focusKeyword) return found;

  // No AI or no usable answer: next evergreen topic not yet covered.
  const lower = covered.map((c) => c.toLowerCase());
  const next =
    EVERGREEN_TOPICS[kind].find((t) => !lower.some((c) => c.includes(t.focusKeyword.toLowerCase()))) ||
    EVERGREEN_TOPICS[kind][new Date().getDate() % EVERGREEN_TOPICS[kind].length];
  return { ...next };
}

const POST_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    metaTitle: { type: "STRING" },
    metaDescription: { type: "STRING" },
    focusKeyword: { type: "STRING" },
    excerpt: { type: "STRING" },
    tags: { type: "ARRAY", items: { type: "STRING" } },
    contentHtml: { type: "STRING" },
    imagePrompt: { type: "STRING" },
    imageAlt: { type: "STRING" },
  },
  required: ["title", "metaTitle", "metaDescription", "focusKeyword", "excerpt", "tags", "contentHtml", "imagePrompt", "imageAlt"],
};

/** Step 2: write the post from the topic and the live store knowledge. */
async function writePost(kind: AutopilotKind, topic: Topic, knowledge: string, links: string[]): Promise<GeneratedPost | null> {
  const spec = SPEC[kind];
  const raw = await geminiGenerate({
    timeoutMs: 45000,
    maxOutputTokens: 8192,
    temperature: 0.7,
    responseSchema: POST_SCHEMA,
    system: `You write the KHAYAL Journal: helpful, specific fragrance writing for readers in Pakistan, in clear British English.
Voice: warm, quietly confident, elegant but simple. Short paragraphs. Natural Roman Urdu words only where they fit (shaadi, mehndi, khushboo).
Rules:
- Genuinely useful first: answer the reader's question in the opening paragraph, then go deeper. Practical tips, examples, Pakistani context (weather, occasions, cities).
- Only state facts about KHAYAL that are in KNOWLEDGE (prices, notes, delivery, tester). Never invent prices, offers, statistics, studies, quotes, reviews or customer stories.
- Never name or compare with other perfume brands or designer fragrances. Never use the words dupe, copy, clone, replica, inspired by or impression. No medical or health claims.
- Recommend 2-4 KHAYAL scents where they genuinely fit, linking each the first time with <a href="/shop/HANDLE">NAME</a> using handles from KNOWLEDGE. You may also link /scent-finder, /faq and /journal. No other internal links.
- No em dashes. No emoji. No filler like "in today's world" or "look no further". No "as an AI".
- contentHtml: ${spec.words} words of HTML using only <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>. Do not repeat the title as a heading. At least 3 <h2> sections, then an <h2>Frequently asked questions</h2> with 3 <h3> questions and short answers, then a final <p> inviting readers to try the scent finder or message KHAYAL on WhatsApp.
- metaTitle: max 58 characters, includes the focus keyword. metaDescription: 140-155 characters, includes the focus keyword, plain and inviting. excerpt: 1-2 sentences, max 240 characters. tags: 3-5 short tags.
- imagePrompt: describe ONE real-looking still-life scene for the cover that fits the topic: ingredients, fabrics, light, setting (no people, no bottles, no text). imageAlt: a plain description of that photo.

KNOWLEDGE
${knowledge}

Pages you may link: ${links.join(", ")}`,
    turns: [
      {
        role: "user",
        text: `Write a ${spec.label} for the KHAYAL Journal.\nTopic: ${topic.topic}\nFocus keyword: ${topic.focusKeyword}\n${topic.angle ? `Angle: ${topic.angle}\n` : ""}${topic.whyNow ? `Why now: ${topic.whyNow}\n` : ""}`,
      },
    ],
  });
  return parseJsonReply<GeneratedPost>(raw);
}

/** Step 3: a photographic cover image, stored on Vercel Blob. Falls back to a site image. */
async function makeCover(post: GeneratedPost, slug: string, topic: string): Promise<{ url: string; alt: string; generated: boolean }> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const image = await geminiImage(`${post.imagePrompt}\n\n${PHOTO_STYLE}`, { aspectRatio: "16:9", timeoutMs: 25000 });
    if (image) {
      const ext = image.mimeType.includes("jpeg") ? "jpg" : image.mimeType.includes("webp") ? "webp" : "png";
      const blob = await put(`journal/${slug}.${ext}`, image.data, {
        access: "public",
        addRandomSuffix: true,
        contentType: image.mimeType,
      });
      return { url: blob.url, alt: clamp(post.imageAlt, 150), generated: true };
    }
  }
  return { ...fallbackImage(`${topic} ${post.title}`), generated: false };
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || `journal-${Date.now()}`;
  for (let i = 2; await Post.exists({ slug }); i++) slug = `${base}-${i}`;
  return slug;
}

export interface AutopilotResult {
  ok: boolean;
  status: IAutopilotRun["status"];
  title?: string;
  postId?: string;
  note?: string;
}

/** Runs one daily slot: find a topic, write it, make a cover, save it (published or draft). */
export async function runAutopilot(kind: AutopilotKind, opts: { force?: boolean } = {}): Promise<AutopilotResult> {
  const startedAt = Date.now();
  const settings = await getAutopilot();
  if (!settings.enabled && !opts.force) return { ok: true, status: "draft", note: "Autopilot is switched off" };
  if (!geminiConfigured()) {
    const note = "GEMINI_API_KEY is not set";
    await recordRun({ kind, at: new Date(), status: "failed", note });
    return { ok: false, status: "failed", note };
  }

  // One post per slot per day, even if the job is triggered twice.
  if (!opts.force) {
    const since = new Date(Date.now() - 20 * 60 * 60 * 1000);
    if (settings.runs.some((r) => r.kind === kind && r.status !== "failed" && new Date(r.at) > since)) {
      return { ok: true, status: "draft", note: "Already ran today" };
    }
  }

  try {
    const author = await User.findOne({ role: "admin" }).sort({ createdAt: 1 }).select("_id").lean();
    if (!author) throw new Error("No admin user to set as the author");

    const recent = await Post.find().sort({ createdAt: -1 }).limit(80).select("title focusKeyword").lean();
    const covered = recent.flatMap((p) => [p.title, p.focusKeyword].filter(Boolean) as string[]);
    const topic = await findTopic(kind, covered);

    const products = await loadKnowledgeProducts();
    const knowledge = await buildStoreKnowledge(products);
    const links = ["/scent-finder", "/faq", "/journal", ...products.filter((p) => p.orderable).map((p) => `/shop/${p.handle}`)];
    const draft = await writePost(kind, topic, knowledge, links);
    if (!draft?.contentHtml || !draft.title) throw new Error("The AI did not return a usable post");

    const post: GeneratedPost = {
      ...draft,
      title: clamp(draft.title, 110),
      metaTitle: clamp(draft.metaTitle || draft.title, 60),
      metaDescription: clamp(draft.metaDescription, 160),
      focusKeyword: clamp(draft.focusKeyword || topic.focusKeyword, 80),
      excerpt: clamp(draft.excerpt, 280),
      tags: [...new Set([SPEC[kind].tag, ...(draft.tags || []).map((t) => clamp(t, 30))])].slice(0, 6),
      contentHtml: sanitizePostHtml(draft.contentHtml, links),
    };
    const quality = checkQuality(post, SPEC[kind].minWords);
    const slug = await uniqueSlug(slugify(post.focusKeyword.length > 12 ? post.focusKeyword : post.title));

    // Leave the image out if we're close to the function's time limit.
    const cover =
      Date.now() - startedAt < 180000
        ? await makeCover(post, slug, topic.topic)
        : { ...fallbackImage(topic.topic), generated: false };

    const publish = settings.autoPublish && quality.ok;
    const words = post.contentHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const created = await Post.create({
      title: post.title,
      slug,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      focusKeyword: post.focusKeyword,
      noIndex: false,
      noFollow: false,
      ogImage: cover.url.startsWith("http") ? cover.url : undefined,
      schemaType: SPEC[kind].schemaType,
      publishedAt: new Date(),
      excerpt: post.excerpt,
      coverImage: { url: cover.url, alt: cover.alt },
      content: post.contentHtml,
      tags: post.tags,
      readTime: Math.max(3, Math.round(words / 220)),
      status: publish ? "published" : "draft",
      authorId: author._id,
    });

    const note = [
      cover.generated ? "AI cover image" : "site image used as cover",
      !quality.ok ? `kept as draft: ${quality.problems.join("; ")}` : "",
      !settings.autoPublish ? "review mode: saved as draft" : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const status = publish ? "published" : "draft";
    await recordRun({ kind, at: new Date(), status, title: post.title, postId: String(created._id), note });

    revalidatePath("/journal");
    revalidatePath(`/journal/${slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/posts");
    return { ok: true, status, title: post.title, postId: String(created._id), note };
  } catch (error) {
    const note = error instanceof Error ? error.message : "Unknown error";
    console.error(`Autopilot ${kind} failed:`, note);
    await recordRun({ kind, at: new Date(), status: "failed", note });
    return { ok: false, status: "failed", note };
  }
}
