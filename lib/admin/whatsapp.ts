"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { requireOrderPermission } from "@/lib/admin/permissions";
import { WhatsAppMessage, type IWhatsAppMessage } from "@/models/WhatsAppMessage";
import { BotAnswer, type IBotAnswer } from "@/models/BotAnswer";
import { sendText } from "@/lib/whatsapp";
import { tokenize } from "@/lib/bot-knowledge";

const PAGE = "/admin/whatsapp";
const DAY = 24 * 60 * 60 * 1000;

async function guard() {
  const perm = await requireOrderPermission("orders.update");
  if (!perm.allowed) throw new Error(perm.error);
}

export interface InboxThread {
  waId: string;
  lastAt: string;
  /** Free-form replies are only allowed within 24 hours of the customer's last message. */
  canReply: boolean;
  messages: IWhatsAppMessage[];
}

export interface BotStats {
  messages: number;
  ai: number;
  library: number;
  unanswered: number;
  needsHuman: number;
}

export async function getBotStats(days = 7): Promise<BotStats> {
  await guard();
  await dbConnect();
  const since = new Date(Date.now() - days * DAY);
  const base = { direction: "in" as const, createdAt: { $gte: since } };
  const [messages, ai, library, unanswered, needsHuman] = await Promise.all([
    WhatsAppMessage.countDocuments(base),
    WhatsAppMessage.countDocuments({ ...base, handledBy: "ai" }),
    WhatsAppMessage.countDocuments({ ...base, handledBy: "library" }),
    WhatsAppMessage.countDocuments({ ...base, unanswered: true }),
    WhatsAppMessage.countDocuments({ ...base, needsHuman: true }),
  ]);
  return { messages, ai, library, unanswered, needsHuman };
}

/** Conversations with a question the bot could not answer, or that need a person, not yet dealt with. */
export async function getInbox(days = 7): Promise<InboxThread[]> {
  await guard();
  await dbConnect();
  const since = new Date(Date.now() - days * DAY);
  const flagged = await WhatsAppMessage.find({
    direction: "in",
    reviewed: false,
    createdAt: { $gte: since },
    $or: [{ unanswered: true }, { needsHuman: true }],
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  const waIds = [...new Set(flagged.map((m) => m.waId))].slice(0, 30);

  return Promise.all(
    waIds.map(async (waId) => {
      const messages = (toJSON(
        await WhatsAppMessage.find({ waId }).sort({ createdAt: -1 }).limit(12).lean()
      ) || []) as IWhatsAppMessage[];
      messages.reverse();
      const lastIn = [...messages].reverse().find((m) => m.direction === "in");
      const lastAt = String(messages[messages.length - 1]?.createdAt || "");
      return {
        waId,
        lastAt,
        canReply: Boolean(lastIn && Date.now() - new Date(lastIn.createdAt).getTime() < DAY),
        messages,
      };
    })
  );
}

export async function getAnswers(): Promise<{ live: IBotAnswer[]; suggested: IBotAnswer[] }> {
  await guard();
  await dbConnect();
  const all = (toJSON(await BotAnswer.find().sort({ updatedAt: -1 }).limit(300).lean()) || []) as IBotAnswer[];
  return { live: all.filter((a) => a.status === "live"), suggested: all.filter((a) => a.status === "suggested") };
}

function keywordsFrom(raw: string, question: string): string[] {
  const typed = raw
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(typed.length ? typed : tokenize(question))].slice(0, 15);
}

export async function replyToCustomer(formData: FormData) {
  await guard();
  await dbConnect();
  const waId = formData.get("waId")?.toString() || "";
  const text = formData.get("text")?.toString().trim() || "";
  if (!/^\d{8,15}$/.test(waId) || !text) return;

  const sent = await sendText(waId, text);
  if (!sent) throw new Error("WhatsApp did not accept the message. The 24-hour reply window may have closed.");
  await WhatsAppMessage.create({ waId, direction: "out", text, handledBy: "flow" });
  await WhatsAppMessage.updateMany({ waId, direction: "in", reviewed: false }, { $set: { reviewed: true } });

  // Optionally teach the bot: save the customer's question and this reply as a library answer.
  const question = formData.get("question")?.toString().trim();
  if (formData.get("saveAnswer")?.toString() === "true" && question) {
    await BotAnswer.create({
      question: question.slice(0, 300),
      answer: text.slice(0, 1500),
      keywords: keywordsFrom("", question),
      status: "live",
      source: "admin",
    });
  }
  revalidatePath(PAGE);
}

export async function markThreadDone(formData: FormData) {
  await guard();
  await dbConnect();
  const waId = formData.get("waId")?.toString() || "";
  await WhatsAppMessage.updateMany({ waId, direction: "in", reviewed: false }, { $set: { reviewed: true } });
  revalidatePath(PAGE);
}

export async function saveAnswer(formData: FormData) {
  await guard();
  await dbConnect();
  const id = formData.get("id")?.toString();
  const question = formData.get("question")?.toString().trim() || "";
  const answer = formData.get("answer")?.toString().trim() || "";
  if (!question || !answer) return;
  const data = {
    question: question.slice(0, 300),
    answer: answer.slice(0, 1500),
    keywords: keywordsFrom(formData.get("keywords")?.toString() || "", question),
    status: "live" as const,
  };
  if (id) await BotAnswer.updateOne({ _id: id }, { $set: data });
  else await BotAnswer.create({ ...data, source: "admin" });
  revalidatePath(PAGE);
}

export async function deleteAnswer(formData: FormData) {
  await guard();
  await dbConnect();
  const id = formData.get("id")?.toString();
  if (id) await BotAnswer.deleteOne({ _id: id });
  revalidatePath(PAGE);
}
