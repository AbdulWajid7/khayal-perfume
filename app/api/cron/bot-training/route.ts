import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { WhatsAppMessage } from "@/models/WhatsAppMessage";
import { BotAnswer } from "@/models/BotAnswer";
import { buildStoreKnowledge, loadLibrary } from "@/lib/bot-assistant";
import { matchLibrary, redactPersonal, tokenize, violatesBrandRules } from "@/lib/bot-knowledge";
import { geminiConfigured, geminiGenerate, parseJsonReply } from "@/lib/gemini";
import { sendEmail, getEmailFrom } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TRAINING_RULES = `You help train KHAYAL's WhatsApp assistant. For each customer question, write the answer the assistant should give in future.
Rules: use ONLY facts in KNOWLEDGE; never invent prices, offers, stock or delivery times; never name other perfume brands or use the words copy, dupe, clone, inspired by or impression; 2-4 short sentences in English, warm and polite.
If KNOWLEDGE does not contain the answer, set canAnswer to false and leave answer empty: the owner will answer it.
question: rewrite the customer's message as a clear, general question. keywords: 3-8 lowercase words in English and Roman Urdu that customers would use for this question.`;

const SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      original: { type: "STRING" },
      question: { type: "STRING" },
      answer: { type: "STRING" },
      keywords: { type: "ARRAY", items: { type: "STRING" } },
      canAnswer: { type: "BOOLEAN" },
    },
    required: ["original", "question", "answer", "keywords", "canAnswer"],
  },
};

interface Draft {
  original: string;
  question: string;
  answer: string;
  keywords: string[];
  canAnswer: boolean;
}

/** Daily: turns yesterday's unanswered WhatsApp questions into suggested answers and emails a summary. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const since = new Date(Date.now() - 26 * 60 * 60 * 1000);
  const base = { direction: "in" as const, createdAt: { $gte: since } };
  const [total, byAi, byLibrary, needsHuman, misses] = await Promise.all([
    WhatsAppMessage.countDocuments(base),
    WhatsAppMessage.countDocuments({ ...base, handledBy: "ai" }),
    WhatsAppMessage.countDocuments({ ...base, handledBy: "library" }),
    WhatsAppMessage.countDocuments({ ...base, needsHuman: true }),
    WhatsAppMessage.find({ ...base, unanswered: true }).sort({ createdAt: -1 }).limit(60).lean(),
  ]);

  // One entry per distinct question that the library still can't answer.
  const { entries } = await loadLibrary();
  const pendingSuggestions = await BotAnswer.find({ status: "suggested" }).select("exampleMessage").lean();
  const alreadySuggested = new Set(pendingSuggestions.map((s) => (s.exampleMessage || "").toLowerCase()));
  const seen = new Set<string>();
  const questions: string[] = [];
  for (const m of misses) {
    const text = redactPersonal((m.text || "").trim());
    const key = tokenize(text).sort().join(" ");
    if (text.length < 4 || !key || seen.has(key) || alreadySuggested.has(text.toLowerCase())) continue;
    seen.add(key);
    if (!matchLibrary(text, entries)) questions.push(text.slice(0, 300));
    if (questions.length >= 15) break;
  }

  let drafts: Draft[] = [];
  if (questions.length && geminiConfigured()) {
    const knowledge = await buildStoreKnowledge();
    const raw = await geminiGenerate({
      system: `${TRAINING_RULES}\n\nKNOWLEDGE\n${knowledge}`,
      turns: [{ role: "user", text: JSON.stringify(questions) }],
      responseSchema: SCHEMA,
      maxOutputTokens: 4000,
      timeoutMs: 40000,
    });
    drafts = parseJsonReply<Draft[]>(raw) || [];
  }

  let suggested = 0;
  const needInput: string[] = [];
  for (const q of questions) {
    const draft = drafts.find((d) => d.original === q);
    if (draft?.canAnswer && draft.answer && !violatesBrandRules(draft.answer)) {
      await BotAnswer.create({
        question: (draft.question || q).slice(0, 300),
        answer: draft.answer.slice(0, 1500),
        keywords: (draft.keywords || []).map((k) => k.toLowerCase().trim()).filter(Boolean).slice(0, 10),
        status: "suggested",
        source: "training",
        exampleMessage: q,
      });
      suggested++;
    } else {
      needInput.push(q);
    }
  }

  const to = process.env.ADMIN_EMAIL;
  if (to && (total > 0 || questions.length > 0)) {
    const lines = [
      "KHAYAL WhatsApp assistant: last 24 hours",
      "",
      `Customer messages: ${total}`,
      `Answered by AI: ${byAi}`,
      `Answered from the library: ${byLibrary}`,
      `Asked for a person: ${needsHuman}`,
      "",
      suggested ? `${suggested} new suggested answers are waiting for your approval.` : "No new suggested answers.",
      ...(needInput.length
        ? ["", "Questions only you can answer (add the answer in admin and the bot learns it):", ...needInput.map((q) => `- ${q}`)]
        : []),
      "",
      `Review: ${siteConfig.url}/admin/whatsapp`,
    ];
    await sendEmail({
      to,
      from: getEmailFrom(),
      subject: `WhatsApp assistant: ${total} messages, ${suggested + needInput.length} to review`,
      text: lines.join("\n"),
    }).catch((error) => console.error("Bot training summary email failed:", error));
  }

  return NextResponse.json({ ok: true, total, questions: questions.length, suggested, needInput: needInput.length });
}
