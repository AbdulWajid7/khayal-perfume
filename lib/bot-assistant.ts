import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import { BotAnswer, type IBotAnswer } from "@/models/BotAnswer";
import { WhatsAppMessage } from "@/models/WhatsAppMessage";
import { faqItems } from "@/lib/content/faq";
import { siteConfig } from "@/lib/site-config";
import { STANDARD_SHIPPING } from "@/lib/shipping";
import { getEnabledBankTransferConfig } from "@/lib/admin/bank-config";
import { geminiGenerate, parseJsonReply, type GeminiTurn } from "@/lib/gemini";
import {
  buildKnowledge,
  FAQ_KEYWORDS,
  isPriceQuestion,
  matchLibrary,
  priceListAnswer,
  redactPersonal,
  violatesBrandRules,
  type KnowledgeProduct,
  type LibraryEntry,
} from "@/lib/bot-knowledge";

export const TESTER_LINE =
  "Every order includes a tester. Try it first; if the scent isn't for you, return the sealed bottle on delivery day.";

export interface AssistantReply {
  reply: string;
  products: { id: string; title: string }[];
  needsHuman: boolean;
  answered: boolean;
  source: "ai" | "library" | "none";
}

function realPrice(p: IProduct): number | null {
  if (p.price > 0) return p.price;
  const variantPrices = (p.variants || []).map((v) => v.price).filter((n) => n > 0);
  return variantPrices.length ? Math.min(...variantPrices) : null;
}

export async function loadKnowledgeProducts(): Promise<KnowledgeProduct[]> {
  const docs = (toJSON(
    await Product.find({ status: { $in: ["active", "draft"] } }).sort({ createdAt: 1 }).lean()
  ) || []) as IProduct[];
  return docs.map((p) => ({
    id: String(p._id),
    handle: p.handle,
    title: p.title,
    category: p.category,
    price: realPrice(p),
    inStock: (p.stock ?? 0) > 0 || (p.variants || []).some((v) => (v.stock ?? 0) > 0),
    orderable: p.status === "active",
    sizeMl: p.sizeMl,
    top: p.scentNotesTop || [],
    heart: p.scentNotesHeart || [],
    base: p.scentNotesBase || [],
    longevity: p.longevity,
    occasion: p.occasion,
    description: p.description,
  }));
}

export async function loadLibrary(): Promise<{ live: IBotAnswer[]; entries: LibraryEntry[] }> {
  const live = (toJSON(await BotAnswer.find({ status: "live" }).sort({ updatedAt: -1 }).limit(200).lean()) ||
    []) as IBotAnswer[];
  const entries: LibraryEntry[] = [
    ...live.map((a) => ({ question: a.question, answer: a.answer, keywords: a.keywords })),
    ...faqItems.map((f) => ({ question: f.question, answer: f.answer, keywords: FAQ_KEYWORDS[f.question] || [] })),
  ];
  return { live, entries };
}

export async function buildStoreKnowledge(products?: KnowledgeProduct[], live?: IBotAnswer[]) {
  const [items, library, bank] = await Promise.all([
    products ? Promise.resolve(products) : loadKnowledgeProducts(),
    live ? Promise.resolve({ live }) : loadLibrary(),
    getEnabledBankTransferConfig(),
  ]);
  return buildKnowledge(items, faqItems, library.live, {
    siteUrl: siteConfig.url,
    phone: siteConfig.phoneDisplay,
    email: siteConfig.email,
    instagram: siteConfig.social.instagram,
    shippingFee: STANDARD_SHIPPING,
    freeShippingThreshold: siteConfig.freeShippingThreshold,
    bankTransferAvailable: Boolean(bank),
    testerLine: TESTER_LINE,
  });
}

export const ASSISTANT_RULES = `You are the WhatsApp sales assistant for KHAYAL, a Pakistani fragrance house. You reply to customers on WhatsApp.

How to reply:
- Match the customer's language and script: English, Urdu script, or Roman Urdu (Urdu written in English letters).
- Keep it short: 2-5 short sentences, under 90 words. Warm, polite, quietly confident. WhatsApp *bold* is fine. No headings, no emoji lists, no hashtags.
- Use ONLY facts in KNOWLEDGE. Never invent prices, stock, discounts, offers, delivery times, ingredients or longevity numbers. If a price is "not announced yet", say the price is coming soon.
- Never mention, compare with or name any other perfume brand or designer fragrance. Never use the words copy, dupe, clone, replica, inspired by or impression. If asked what a KHAYAL scent "smells like" from another brand, say each KHAYAL scent is its own creation and describe its notes.
- When recommending, ask at most one short question (for whom, which occasion, fresh or warm) if you truly need it; otherwise recommend 1-2 scents by their exact KHAYAL name and say why in a few words. Put their handles in productHandles.
- To order, tell them to tap the scent's button below or type *menu* and choose Browse Perfumes. Never collect name, phone or address in this chat.
- For order status, ask them to tap "Track My Order" in the menu (type *menu*).
- Allergies or skin concerns: suggest trying the tester on a small patch of skin first and list the notes. No medical advice.
- Set needsHuman to true for: complaints, damaged or wrong items, refund or return requests, payment problems, bulk or corporate orders (more than 10 bottles), shop or wholesale partnerships, an angry customer, or anything important you cannot answer from KNOWLEDGE. In that case say a team member will reply here shortly.
- Set answered to false if KNOWLEDGE does not contain the answer. Do not guess.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING" },
    productHandles: { type: "ARRAY", items: { type: "STRING" } },
    needsHuman: { type: "BOOLEAN" },
    answered: { type: "BOOLEAN" },
  },
  required: ["reply", "productHandles", "needsHuman", "answered"],
};

async function recentTurns(waId: string, current: string): Promise<GeminiTurn[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  // Only free-text questions and the assistant's replies; order-flow messages (names, addresses) never leave the server.
  const history = await WhatsAppMessage.find({ waId, createdAt: { $gte: since }, handledBy: { $ne: "flow" } })
    .sort({ createdAt: -1 })
    .limit(9)
    .lean();
  const turns: GeminiTurn[] = [];
  for (const m of history.reverse()) {
    const text = redactPersonal((m.text || "").trim());
    if (!text) continue;
    const role = m.direction === "in" ? "user" : "model";
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.text += `\n${text}`;
    else turns.push({ role, text });
  }
  // The current message is already logged; make sure the conversation ends with it.
  if (!turns.length || turns[turns.length - 1].role !== "user") turns.push({ role: "user", text: redactPersonal(current) });
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns.slice(-8);
}

/** Answers a typed customer question with the AI assistant, falling back to the answer library. */
export async function answerCustomer(waId: string, text: string): Promise<AssistantReply> {
  await dbConnect();
  const [products, library] = await Promise.all([loadKnowledgeProducts(), loadLibrary()]);
  const byHandle = new Map(products.filter((p) => p.orderable).map((p) => [p.handle, p]));

  const knowledge = await buildStoreKnowledge(products, library.live);
  const raw = await geminiGenerate({
    system: `${ASSISTANT_RULES}\n\nKNOWLEDGE\n${knowledge}`,
    turns: await recentTurns(waId, text),
    responseSchema: RESPONSE_SCHEMA,
  });
  const ai = parseJsonReply<{ reply?: string; productHandles?: string[]; needsHuman?: boolean; answered?: boolean }>(raw);

  if (ai?.reply && !violatesBrandRules(ai.reply)) {
    const picks = (ai.productHandles || [])
      .map((h) => byHandle.get(h))
      .filter((p): p is KnowledgeProduct => Boolean(p))
      .slice(0, 2)
      .map((p) => ({ id: p.id, title: p.title }));
    return {
      reply: ai.reply.trim().slice(0, 1000),
      products: picks,
      needsHuman: Boolean(ai.needsHuman),
      answered: ai.answered !== false,
      source: "ai",
    };
  }

  // No AI (no key, quota, timeout) or an unsafe reply: use the answer library.
  if (isPriceQuestion(text)) {
    return { reply: priceListAnswer(products), products: [], needsHuman: false, answered: true, source: "library" };
  }
  const hit = matchLibrary(text, library.entries);
  if (hit) {
    await BotAnswer.updateOne({ question: hit.question, status: "live" }, { $inc: { timesUsed: 1 } }).catch(() => {});
    return { reply: hit.answer, products: [], needsHuman: false, answered: true, source: "library" };
  }
  return { reply: "", products: [], needsHuman: false, answered: false, source: "none" };
}

export async function logMessage(entry: {
  waId: string;
  direction: "in" | "out";
  text: string;
  replyId?: string;
  handledBy?: "flow" | "ai" | "library" | "fallback";
  unanswered?: boolean;
  needsHuman?: boolean;
}) {
  try {
    return await WhatsAppMessage.create(entry);
  } catch (error) {
    console.error("WhatsApp message log failed:", error);
    return null;
  }
}
